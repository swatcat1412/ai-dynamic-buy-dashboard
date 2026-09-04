# AI Dynamic Buy Dashboard V2 — Phase 9 Production Acceptance

วันที่เริ่ม: 4 กันยายน 2026 (Asia/Bangkok)

## เป้าหมาย

ตรวจรับระบบ V2 หลัง Merge โดยไม่เพิ่ม Feature ใหม่

## Acceptance checklist

- [x] `main` มี Phase 0–8 และ Vercel status ของ commit ล่าสุดผ่าน
- [x] Unit tests, ESLint, TypeScript และ production build ผ่านบน main ล่าสุด
- [ ] ตรวจ Port 1/Port 2 ใน Production และยืนยันทุกแผงเปลี่ยนตามกัน
- [ ] ตรวจ Zone B ของหุ้นทุกตัวต้องมีช่วงราคา `min < max`
- [ ] ตรวจ THB budget planner ด้วยงบหลายค่าและยอดรวมตรงกัน
- [ ] ตรวจ Port 2 API response, cache และ quota ใน production
- [ ] ยืนยัน target weights จริงแทนค่า provisional 20% ต่อหุ้น

## Boundary

ระบบยังเป็น decision support เท่านั้น ไม่มี auto-order, transaction persistence หรือการเปลี่ยนแปลง Supabase schema

จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
