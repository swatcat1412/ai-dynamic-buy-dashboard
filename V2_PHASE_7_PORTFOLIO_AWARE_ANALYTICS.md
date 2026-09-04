# AI Dynamic Buy Dashboard V2 — Phase 7 Portfolio-aware Analytics

วันที่เริ่ม: 4 กันยายน 2026 (Asia/Bangkok)

## เป้าหมาย

ทำให้แผงวิเคราะห์รายหุ้นทั้งหมดใช้ Portfolio selection เดียวกับ Portfolio overview

## Behavior

- Technical Indicators เปลี่ยนรายการ Symbol ตาม Port ที่เลือก
- Price History เปลี่ยนรายการ Symbol ตาม Port ที่เลือก
- Buy Engine และ Stock Opportunity เปลี่ยนรายการ Symbol ตาม Port ที่เลือก
- Market News ขอข่าวเฉพาะหุ้นของ Port ที่เลือก และแยก cache ตามชุด Symbol

## Safety boundary

- ไม่เปลี่ยน scoring rules หรือ budget planner
- ไม่ส่งคำสั่งซื้อและไม่บันทึก transaction
- ไม่แก้ Supabase schema/data
- โหลดข้อมูลเฉพาะหุ้นของ Port ปัจจุบันเพื่อลด API usage

## Verification

- Unit tests: 34/34 ผ่าน
- ESLint: ผ่าน
- TypeScript: ผ่าน
- Next.js production build: ผ่าน

จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
