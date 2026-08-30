# AI Dynamic Buy Dashboard — Project Handoff

อัปเดตล่าสุด: 2026-08-30 (Asia/Bangkok)

เอกสารนี้ใช้เป็นจุดเริ่มต้นเมื่อเปิดโปรเจกต์จากเครื่องอื่น ห้ามใส่ API key หรือ Supabase secret ลงใน Git

## Project

- Repository: `swatcat1412/ai-dynamic-buy-dashboard`
- Production: https://ai-dynamic-buy-dashboard.onrender.com
- Framework: Next.js 16.3.2
- Branch หลัก: `main`
- Ruleset: `Protect main with Quality Gate` (ID `21860785`), Active, target `main`

## Phase status

- Phase 0–10: ผ่านและใช้งานใน production แล้ว
- Phase 11: Quality Gate workflow ผ่าน และ merge เข้า `main` แล้ว
- Phase 12: repository เป็น Public และเปิด Ruleset ป้องกัน `main`; PR #12 เป็นเอกสาร/การตั้งค่าเท่านั้น และต้องตรวจสถานะ merge หลัง CI ล่าสุดผ่าน
- Phase ถัดไปที่แนะนำ: Phase 13 — Vercel deployment/observability หลังยืนยัน PR #12 และ production smoke

## Ruleset policy

- Require a pull request before merging
- Required approvals: 0 (เจ้าของคนเดียว)
- Require branches to be up to date
- Require status check: `Quality Gate`
- Block force pushes
- Restrict deletions
- Bypass list: ว่าง

## Current portfolio

รวม 100%: GOOGL 12.5%, LLY 15%, JEPQ 25%, TSM 12.5%, VRT 10%, MSFT 7.5%, PG 12.5%, RKLB 5%

## Production acceptance ที่ตรวจแล้ว

- `/api/market/status`: `ok=true`, persistent cache configured/reachable/hasEntries เป็น `true`
- `/api/market/quotes`: ได้ข้อมูลครบ 8 หุ้น รวม RKLB
- History: ใช้ normalized daily 260 bars และ shared upstream request
- Rate limit: Twelve Data guard 7 requests ต่อ rolling window 60 วินาที
- Cache TTL: 30 นาที
- Daily Workflow UI ถูกถอดตามที่อนุมัติ; ตาราง Supabase เดิมยังเก็บไว้เพื่อย้อนกลับได้
- Footer มาตรฐาน:
  `จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.`

## เริ่มงานบน Windows เครื่องอื่น

```powershell
Set-Location 'C:\path\to\ai-dynamic-buy-dashboard'
git clone https://github.com/swatcat1412/ai-dynamic-buy-dashboard.git
git fetch origin
git switch main
git pull --ff-only
npm.cmd ci --ignore-scripts --no-audit --no-fund
npm.cmd test
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
```

ถ้า `npm ci` ชนไฟล์ SWC หรือ cache ที่ถูกล็อก ให้หยุด dev server ของโปรเจกต์ก่อน หรือใช้ cache แยก:

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund --cache 'C:\Users\<user>\AppData\Local\Temp\codex-npm-cache-ai-dashboard'
```

เกณฑ์ผ่าน: tests ทุกข้อผ่าน, lint ไม่มี error, typecheck สำเร็จ และ production build สำเร็จ

## Environment secrets

ตั้งค่าเฉพาะใน Render/Supabase/Vercel Environment Variables ไม่ commit ลง repository:

- `TWELVE_DATA_API_KEY`
- `FRED_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (หรือชื่อที่ production ใช้อยู่ตาม deployment ปัจจุบัน)

## ขั้นถัดไป

1. ตรวจ PR #12 ว่า required check แสดงผลสำเร็จและ squash merge ได้ภายใต้ Ruleset
2. หลัง merge ให้ตรวจ `main` และ production health อีกครั้ง
3. เริ่ม Phase 13: สร้าง Vercel project จาก repository นี้, ตั้งค่า env แยก production/preview, แล้วทำ smoke test ทุก market route

Vercel ใช้กับ Next.js app ปัจจุบันได้ ไม่จำเป็นต้องมี compatibility phase เพิ่ม; สิ่งสำคัญคือ env vars, domain, preview protection และ production smoke test

จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
