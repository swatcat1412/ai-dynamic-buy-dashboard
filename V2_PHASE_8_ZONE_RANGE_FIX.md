# AI Dynamic Buy Dashboard V2 — Phase 8 Zone B Range Fix

วันที่เริ่ม: 4 กันยายน 2026 (Asia/Bangkok)

## ปัญหา

เมื่อราคาปัจจุบันต่ำกว่า EMA20 สูตรเดิมใช้ `min(price, EMA20)` ทำให้ขอบล่างของ Zone B เท่ากับราคาปัจจุบันและเกิดช่วงราคาเป็นศูนย์ เช่น `70.16–70.16`

## การแก้ไข

- ใช้ EMA20 เป็นขอบล่างเฉพาะเมื่อ EMA20 ต่ำกว่าราคาปัจจุบัน
- หาก EMA20 อยู่เหนือราคาปัจจุบัน ใช้ระยะต่ำกว่าราคาปัจจุบันอย่างน้อย 1% หรือครึ่ง ATR
- เพิ่ม regression assertion ให้ Zone B ต้องมี `min < max`

## Safety boundary

- ไม่เปลี่ยน allocation หรือ scoring
- ไม่เปลี่ยนข้อมูลธุรกรรม
- เป็นการแก้การคำนวณระดับราคาเท่านั้น

## Verification

- Unit tests: 34/34 ผ่าน
- ESLint: ผ่าน
- TypeScript: ผ่าน
- Next.js production build: ผ่าน

จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
