# AI Dynamic Buy Dashboard V2 — Phase 3 Portfolio Selector

วันที่เริ่ม: 4 กันยายน 2026 (Asia/Bangkok)

## เป้าหมาย

ทำให้ Portfolio ในหน้า Overview เลือก Port 1/Port 2 ได้จริง และใช้รายการหุ้น V2 แทนรายการเดิมที่มี TSM/MSFT

## รายการหุ้น

- Port 1: JEPQ, GOOGL, LLY, RKLB, VRT
- Port 2: DGRO, VIG, O, KO, PG
- นำ TSM และ MSFT ออกจาก active target portfolio

## ขอบเขตการเปลี่ยนแปลง

- เพิ่ม Portfolio selector ใน Live Portfolio
- เปลี่ยนรายการหุ้นและ allocation bar ตาม Port ที่เลือก
- โหลด quotes เฉพาะหุ้นของ Port ที่เลือกผ่าน `portfolioId`
- อนุญาต history endpoint สำหรับหุ้น V2 ใหม่
- คง Buy Engine และ transaction workflow เป็น decision support เท่านั้น
- ไม่แก้ Supabase schema/data และไม่ส่งคำสั่งซื้อ

## Allocation note

Phase นี้ใช้สัดส่วนเริ่มต้น 20% ต่อหุ้นในทั้งสองพอร์ต เพื่อให้รวมเป็น 100% และรองรับ selector ก่อน ผู้ใช้ควรยืนยันสัดส่วนเป้าหมายก่อนใช้เป็นแผนลงทุนจริง

## Verification

- Unit tests: 31/31 ผ่าน
- ESLint: ผ่าน
- TypeScript: ผ่าน
- Next.js production build: ผ่าน

จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
