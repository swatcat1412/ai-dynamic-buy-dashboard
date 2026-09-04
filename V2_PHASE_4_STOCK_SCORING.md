# AI Dynamic Buy Dashboard V2 — Phase 4 Stock Opportunity Scoring

วันที่เริ่ม: 4 กันยายน 2026 (Asia/Bangkok)

## เป้าหมาย

แยก Stock Score ออกจากเงินลงทุน และเพิ่ม Market Context เป็นโบนัสสำหรับการจัดลำดับโอกาส โดยไม่คำนวณจำนวนเงินบาทและไม่ส่งคำสั่งซื้อ

## Scoring model

- `stockScore`: คะแนนเดิมจาก Buy Engine (0–100) ที่มาจาก RSI, MACD, volume, VIX และ support
- `marketMultiplier`: ค่า 0.5×–2× จาก Nasdaq Market Opportunity
- `marketBonus`: 0–20 คะแนนตาม multiplier
- `opportunityScore`: `min(100, stockScore + marketBonus)` ใช้เพื่อจัดลำดับเท่านั้น

หาก Market Context ใช้งานไม่ได้ จะไม่ให้ market bonus และยังแสดง stock score ที่ตรวจสอบได้

## เงินลงทุน

Phase นี้ไม่มีการคำนวณเงินลงทุน การกำหนดงบและการแบ่ง 3 bullets ใน Phase ถัดไปจะใช้หน่วย `บาท (THB)` เท่านั้น

## Safety boundary

- ไม่แก้ Supabase schema/data
- ไม่บันทึก transaction
- ไม่สร้างคำสั่งซื้ออัตโนมัติ
- ไม่แปลง score เป็นจำนวนหุ้นหรือจำนวนเงิน

## Verification

- Unit tests: 34/34 ผ่าน
- ESLint: ผ่าน
- TypeScript: ผ่าน
- Next.js production build: ผ่าน

จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
