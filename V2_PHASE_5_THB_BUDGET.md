# AI Dynamic Buy Dashboard V2 — Phase 5 THB Budget Planner

วันที่เริ่ม: 4 กันยายน 2026 (Asia/Bangkok)

## เป้าหมาย

แปลง Monthly Purchase Policy ให้ผู้ใช้กรอกงบรายเดือนและเห็นจำนวนเงินเป็นเงินบาท (THB) แยกตาม 3 bullets โดยไม่ผูกกับ Stock Score หรือส่งคำสั่งซื้อ

## Rules

- Starter: 25%
- Pullback: 30%
- Correction: 45%
- ยอดรวมที่ปัดเศษต้องเท่ากับงบที่กรอก
- เงินที่ยังไม่ใช้ถือเป็น reserve จนกว่าจะยืนยันการตัดสินใจเอง

## Safety boundary

- ไม่มีการคำนวณจำนวนหุ้นใน Phase นี้
- ไม่มีการส่งคำสั่งซื้อหรือบันทึกธุรกรรม
- ไม่แก้ Supabase schema/data
- THB เป็นสกุลเงินเดียวของ budget planner

## Verification

- Unit tests: 34/34 ผ่าน
- ESLint: ผ่าน
- TypeScript: ผ่าน
- Next.js production build: ผ่าน

จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
