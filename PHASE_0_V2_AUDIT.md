# AI Dynamic Buy Dashboard V2 — Phase 0 Audit

วันที่ตรวจ: 4 กันยายน 2026 (Asia/Bangkok)

สถานะ: **ผ่านบางส่วน — source และ production data path ใช้งานได้ แต่ยังมี reliability/observability gaps ที่ต้องปิดก่อน Phase 1**

## ขอบเขตและข้อจำกัด

ตรวจแบบ read-only เป็นหลัก ครอบคลุม repository structure, Git baseline, market-data provider, quota/cache design, Render runtime contract, Supabase connection, endpoints สำหรับ status/quotes/history/indicators/buy-engine และสาเหตุของข้อความ `Daily data Not connected`

- ไม่แก้ production, Render environment, Supabase schema/RLS หรือ API keys
- ไม่พบไฟล์ `AI_Dynamic_Buy_Dashboard_V2_Upgrade_Plan.md` ใน checkout, `sources/` หรือ attachments ที่เปิดอ่านได้ จึงใช้ขอบเขต Phase 0 ที่ผู้ใช้ระบุในคำสั่งเป็น source of truth สำหรับรอบนี้
- Render Dashboard ต้อง Sign in และไม่มี authenticated browser session ในรอบตรวจ จึงยืนยัน Environment Variable **names/values และ deploy settings จากหน้า Dashboard ไม่ได้**
- ไม่อ่าน แสดง หรือบันทึกค่า secret ใด ๆ

## 1. Git baseline และจุดย้อนกลับ

- Repository: `swatcat1412/ai-dynamic-buy-dashboard`
- Remote: `origin`
- Latest verified remote base: `origin/main` = `04124829138cf4909863b0dd73f0bd19de3a34bc`
- สร้าง local branch: `v2-phase-0-audit`
- Branch ถูก fast-forward ให้เริ่มจาก `origin/main` ล่าสุดแล้ว
- ยังไม่ push branch และไม่กระทบ Render production
- Local `main` ยังอยู่ที่ `5c44aa3`; อย่าใช้ local `main` เป็นฐาน V2 จนกว่าจะ fast-forward

## 2. Repository structure และ data flow

### Runtime

- Next.js 16.3.2 / React 19 / TypeScript
- Market API routes: status, quotes, history, indicators, buy-engine, macro และ news
- Market provider: Twelve Data `/time_series`, interval `1day`, normalized เป็น 260 bars ต่อ symbol
- Indicators และ Buy Engine คำนวณ server-side จาก history ชุดเดียวกัน
- In-memory promise cache ทำ request deduplication ภายใน process
- Supabase `market_api_cache` เป็น persistent cache ข้าม request/deploy
- Market cache TTL: 30 นาที
- Portfolio registry ปัจจุบันมี 8 symbols: `GOOGL, LLY, JEPQ, TSM, VRT, MSFT, PG, RKLB`

### Render configuration ที่ยืนยันได้

- ไม่มี `render.yaml`, `render.yml` หรือ Dockerfile ใน repository; deployment settings จึงเป็น dashboard-managed configuration
- Production URL: `https://ai-dynamic-buy-dashboard.onrender.com`
- Runtime status ยืนยันว่ามี `TWELVE_DATA_API_KEY` และ Supabase server cache config
- ยังยืนยันจาก Render Dashboard ไม่ได้ว่า build/start command, branch, instance count, auto-deploy policy และ Environment Variable names ตรงกับเอกสารทั้งหมด

### Supabase configuration ที่ยืนยันได้

- Production status รายงาน `configured=true`, `reachable=true`, `hasEntries=true`
- `market_api_cache` เปิด RLS และ revoke `anon`, `authenticated`, `PUBLIC`; server ใช้ secret key เท่านั้น
- Code ให้ `SUPABASE_SECRET_KEY` เป็นชื่อหลัก และ fallback ไป `SUPABASE_SERVICE_ROLE_KEY`
- Browser client ใช้เฉพาะ publishable key แต่ Daily Workflow UI ถูกถอดจากหน้า production แล้วใน Phase 10
- Production REST cache ยังทำงาน ณ เวลาตรวจ จึงยังไม่กระทบจาก Data API exposure policy ปัจจุบัน
- สำหรับ environment ใหม่ ต้องตรวจ Data API exposure/grants เพิ่มเติม เพราะ Supabase จะบังคับไม่ auto-expose ตารางใหม่ทั้งหมดในวันที่ 30 ตุลาคม 2026

## 3. Market-data quota และ cache assessment

Twelve Data Basic ปัจจุบันให้ 8 API credits/นาที และ 800 credits/วัน ส่วน `/time_series` ใช้ 1 credit ต่อ symbol แม้ batch หลาย symbol จะลดจำนวน HTTP requests แต่ยังคิด credits ตามจำนวน symbol

### พฤติกรรมของระบบปัจจุบัน

- Cold cache ของ portfolio 8 symbols ต้องใช้ 8 credits
- Local limiter อนุญาต 7 upstream requests ต่อ rolling 60 วินาทีเพื่อเหลือ buffer 1 credit
- ผลคือ symbol ที่ 8 รอรอบถัดไป; production `/api/market/quotes` ที่ตรวจจริงใช้เวลาประมาณ **61.5 วินาที** เมื่อ cache เย็น
- เมื่อ cache อุ่นแล้ว RKLB history ใช้ประมาณ 0.8 วินาที, indicators 0.3 วินาที และ buy-engine 0.8 วินาที
- ด้วย TTL 30 นาที เพดานเชิงทฤษฎีกรณีมี traffic ต่อเนื่องคือ `8 symbols × 48 refreshes/day = 384 credits/day` ซึ่งต่ำกว่า Basic daily quota 800 แต่มี latency spike ทุกครั้งที่ 8 cache keys หมดอายุใกล้กัน

### ช่องว่างที่ยังมี

- Limiter นับจำนวน HTTP requests ไม่ได้นับ API credits ตาม response headers
- ระบบไม่เก็บ/แสดง `api-credits-used` และ `api-credits-left`
- ไม่เรียก `/api_usage`; จึงยืนยัน actual plan และ actual daily consumption ไม่ได้จาก source/runtime ปัจจุบัน
- Limiter เป็น process-local; ถ้า Render scale มากกว่า 1 instance จะไม่ป้องกัน quota ร่วมกัน
- ไม่มี upstream timeout, retry/backoff สำหรับ 429/5xx หรือ stale-cache fallback
- Cache health รายงานเพียงว่ามี row แต่ไม่ได้บอกว่า row ล่าสุดยังไม่หมดอายุหรือ symbols ครบ 8 ตัว

## 4. Endpoint verification

ตรวจ production วันที่ 4 กันยายน 2026:

| Endpoint | ผล | หลักฐานสำคัญ |
|---|---|---|
| `/api/market/status` | 200 | `api-ready`, Twelve Data configured, Supabase cache reachable/has entries, TTL 30 นาที |
| `/api/market/quotes` | 200 | quotes ครบ 8 symbols; cold-cache latency ประมาณ 61.5 วินาที |
| `/api/market/history?symbol=RKLB&range=260` | 200 | 260 daily OHLCV bars, ล่าสุด 2026-09-03 |
| `/api/market/indicators?symbol=RKLB` | 200 | 260 bars, RSI/MACD/EMA/Volume/ATR/ADX/OBV/support/resistance ครบ |
| `/api/market/buy-engine?symbol=RKLB` | 200 | engine ใช้ daily close + indicators + macro สำเร็จ |
| `/api/market/history?symbol=BAD` (local) | 400 | symbol validation ทำงาน |
| routes ที่ต้องใช้ provider เมื่อ local ไม่มี key | 503 | fallback contract ทำงานและไม่ใช้ static quote ปลอม |

หน้า production ที่เปิดตรวจแสดง `Daily data Configured`, `Daily prices connected` และไม่มี browser console error ที่ตรวจพบ

## 5. สาเหตุ `Daily data Not connected`

### ยืนยันจาก code แล้ว

ข้อความนี้ไม่ได้เป็น health check ของข้อมูลรายวันจริง แต่ผูกกับ boolean `liveDataAvailable` ซึ่งปัจจุบันเท่ากับ `Boolean(TWELVE_DATA_API_KEY)` เท่านั้น

`DataStatus` เริ่มต้นด้วย `liveDataAvailable=false` จึงแสดง `Not connected` ระหว่างรอ request และเมื่อ fetch `/api/market/status` ล้มเหลว code จะกลืน error (`catch(() => undefined)`) ทำให้ค้างข้อความเดิมโดยไม่มีรายละเอียดหรือ retry

ดังนั้น UI สามารถแสดง `Not connected` ได้ทั้งที่ provider/cache ยังทำงานอยู่ โดยเฉพาะช่วง Render cold start, network failure หรือ status request ช้า

### ปัจจัยร่วมที่ยืนยันแล้ว

Cold-cache request ของ 8 symbols ใช้ประมาณ 61.5 วินาทีจากนโยบาย 7 requests/60s ทำให้ section อื่นค้าง loading นาน และสร้างประสบการณ์เหมือนระบบไม่เชื่อมต่อ แม้ status endpoint จะรายงาน configured

### สิ่งที่ยังยืนยันไม่ได้

ยังระบุไม่ได้ว่าเหตุการณ์เดิมเกิดจาก Render ไม่มี key ณ เวลานั้น, deploy/cold start, request failure, quota 429 หรือ UI initial state เพราะไม่มี Render logs และ historical browser network trace ในรอบนี้

สรุป root cause ที่แม่นยำที่สุด: **สถานะ UI ออกแบบไม่ให้แยก configured / reachable / fresh / error และกลืน status error; อาการเดิมอาจถูกกระตุ้นโดย latency หรือ runtime failure แต่ production ปัจจุบันไม่ได้ outage**

## 6. สิ่งที่ต้องแก้ก่อน Phase 1

จัดลำดับตามผลต่อความน่าเชื่อถือ:

1. **แก้ status model** ให้แยก `checking`, `configured`, `connected`, `degraded`, `error`; ตรวจ `response.ok`, แสดง error และ retry แทนการกลืน error
2. **แก้ cold-cache architecture** ไม่ให้ first page load รอเกิน 60 วินาที: แนะนำ prewarm/staggered refresh หรือ batch-aware upstream scheduler พร้อม partial results; อย่าเพียงเพิ่ม timeout
3. **เพิ่ม quota observability** บันทึก credit headers แบบไม่เก็บ key และแสดง remaining/minute + daily usage; ยืนยัน plan จริงก่อนเปลี่ยน limiter
4. **เพิ่ม resilience** ด้วย upstream timeout, bounded retry/backoff, 429 handling และ stale-if-error cache
5. **ยกระดับ cache health** ให้รายงาน freshness, expiration และ coverage ครบ 8 symbols; `hasEntries=true` อย่างเดียวไม่เพียงพอ
6. **ยืนยัน Render Dashboard** หลัง Sign in: branch=`main`, build/start commands, auto-deploy, instance count และ env variable names โดยดูเฉพาะชื่อ/สถานะ masked
7. **เตรียม Supabase สำหรับ policy ใหม่** ตรวจ Data API exposure ของ `market_api_cache` ใน environment ใหม่ และคงการใช้ `SUPABASE_SECRET_KEY`; legacy `service_role` เป็น fallback ชั่วคราวเท่านั้น
8. **กู้หรือยืนยัน V2 plan ต้นฉบับ** ก่อนเปลี่ยน algorithm เพื่อป้องกัน scope drift จาก Blueprint ที่ไม่อยู่ใน checkout

## 7. Phase gate

Phase 0 ให้สถานะ **ผ่านบางส่วน**:

- ผ่าน: Git baseline/branch, repository map, source quality gate, production status/quotes/history/indicators/buy-engine, Supabase runtime connection
- ยังไม่ผ่าน: Render Dashboard configuration verification, actual quota telemetry, deterministic reproduction จาก historical `Not connected`
- **ยังไม่ควรเริ่มแก้ V2 algorithm ใน Phase 1** จนกว่าจะปิดข้อ 1–5 หรืออนุมัติให้ข้อ 6–8 เป็น documented follow-up

## 8. PowerShell verification commands

PowerShell:

```powershell
Set-Location 'C:\Users\Pong\.codex\.chatgpt-projects\g-p-6a8a8f60e62c8191931a4c44af43ab16\ai-dynamic-buy-dashboard'
git fetch --prune origin
git switch v2-phase-0-audit
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
npm.cmd test
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
git diff --check
```

Expected Result:

- ก่อนมี Phase 0 documentation commit, `HEAD` และ `origin/main` ตรงกันที่ `0412482...`
- tests 15/15 ผ่าน
- lint/typecheck/build สำเร็จและ `git diff --check` ไม่มี error

Production smoke (ไม่ต้องใส่ API key):

```powershell
$base = 'https://ai-dynamic-buy-dashboard.onrender.com'
Invoke-RestMethod "$base/api/market/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "$base/api/market/quotes" | ConvertTo-Json -Depth 8
Invoke-RestMethod "$base/api/market/history?symbol=RKLB&range=260" | ConvertTo-Json -Depth 5
Invoke-RestMethod "$base/api/market/indicators?symbol=RKLB" | ConvertTo-Json -Depth 5
```

Expected Result:

- ทุก endpoint มี `ok=true`
- status มี `liveDataAvailable=true`, cache `reachable=true`
- quotes ครบ 8 symbols และ history มี 260 bars

ถ้าไม่ตรงกับ Expected Result:

```powershell
$base = 'https://ai-dynamic-buy-dashboard.onrender.com'
$response = Invoke-WebRequest "$base/api/market/status" -SkipHttpErrorCheck
$response.StatusCode
$response.Content
```

ให้เก็บเฉพาะ HTTP status/error message และ timestamp; ห้ามคัดลอก API key หรือ secret ออกจาก Render/Supabase

## Sources

- [Twelve Data — Credits](https://support.twelvedata.com/en/articles/5615854-credits)
- [Twelve Data — Individual Pricing](https://twelvedata.com/pricing)
- [Twelve Data — Control over API usage](https://support.twelvedata.com/en/articles/5713553-control-over-api-usage)
- [Twelve Data — Batch API requests](https://support.twelvedata.com/en/articles/5203360-batch-api-requests)
- [Supabase — API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase — Securing your API](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase — Changelog](https://supabase.com/changelog)

จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
