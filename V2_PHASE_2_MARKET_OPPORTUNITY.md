# AI Dynamic Buy Dashboard V2 — Phase 2 Market Opportunity

วันที่เริ่ม: 4 กันยายน 2026 (Asia/Bangkok)

## เป้าหมาย

เปลี่ยน Market Score จำลองให้เป็น Market Opportunity ที่ตรวจสอบได้จาก Nasdaq Composite daily observations และเชื่อมกับ Correction Multiplier ของ Phase 1

## Data flow

`FRED NASDAQCOM` → valid daily observations → recent high 20/60/120 sessions → drawdown → market regime → multiplier 0.5×–2×

## Decision rules

| Drawdown จาก 120-session high | Regime | Multiplier |
|---:|---|---:|
| น้อยกว่า 3% | Normal | 0.5× |
| 3% ถึงน้อยกว่า 5% | Pullback | 1× |
| 5% ถึงน้อยกว่า 10% | Correction | 1.5× |
| 10% ถึงน้อยกว่า 15% | Major Correction | 1.75× |
| 15% ขึ้นไป | Panic Opportunity | 2× |

## Safety boundary

- ใช้ FRED series ที่ระบบมีอยู่แล้ว ไม่เพิ่ม Twelve Data credits
- ไม่ใช้ค่า Market Score จำลองเมื่อ live endpoint ล้มเหลว
- ต้องมี valid observations อย่างน้อย 20 จุด; history ต่ำกว่า 120 จุดต้องแสดง partial
- Multiplier เป็น market context ไม่ใช่คำสั่งซื้อ และยังไม่เลือกหุ้นหรือจำนวนเงินอัตโนมัติ
- ไม่เปลี่ยน Supabase schema/data และไม่บันทึกธุรกรรม

## Gate ก่อน Phase 3

1. ตรวจ FRED production response และวันที่ข้อมูลล่าสุด
2. ตรวจ boundary ของ drawdown ทุก regime ด้วย unit tests
3. ผ่าน lint, typecheck, production build และ browser QA ทั้ง success/error state
4. Phase 3 จึงค่อยรวม Stock Opportunity Score กับ market multiplier

## Local verification result

- Unit tests: 31/31 ผ่าน
- ESLint และ TypeScript: ผ่าน
- Next.js production build: ผ่าน และมี route `/api/market/opportunity`
- No-secret API contract: HTTP 503 พร้อมข้อความ `FRED_API_KEY is not configured`
- Browser QA: desktop และ mobile 390×844 แสดง error state ถูกต้อง, ไม่ล้นแนวนอน และไม่พบ console error
- Live success state: รอตรวจบน Vercel Preview ซึ่งมี deployment environment แยกจาก local

จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
