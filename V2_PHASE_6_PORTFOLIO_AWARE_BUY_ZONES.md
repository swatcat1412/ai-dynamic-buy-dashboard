# AI Dynamic Buy Dashboard V2 — Phase 6 Portfolio-aware Buy Zones

วันที่เริ่ม: 4 กันยายน 2026 (Asia/Bangkok)

## เป้าหมาย

ให้ Dynamic Buy Zones ใช้ Portfolio selection เดียวกับ Portfolio overview และเปลี่ยนรายการหุ้นตาม Port ที่ผู้ใช้เลือก

## Behavior

- Port 1 แสดง GOOGL, LLY, JEPQ, VRT, RKLB
- Port 2 แสดง DGRO, VIG, O, KO, PG
- การเปลี่ยน Port จะ trigger การโหลด Buy Engine ใหม่เฉพาะหุ้นของ Port นั้น
- ไม่มีการใช้รายการหุ้นจากอีก Port ปะปนในตาราง

## Safety boundary

- ไม่เปลี่ยน scoring rules หรือเงินลงทุน
- ไม่ส่งคำสั่งซื้อและไม่บันทึก transaction
- ใช้ API quota เฉพาะหุ้นของ Port ที่กำลังดู

## Verification

- Unit tests: 34/34 ผ่าน
- ESLint: ผ่าน
- TypeScript: ผ่าน
- Next.js production build: ผ่าน

จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
