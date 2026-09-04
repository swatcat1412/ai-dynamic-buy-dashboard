# AI Dynamic Buy Dashboard V2 — Phase 10 Shared Symbol Selection

วันที่เริ่ม: 4 กันยายน 2026 (Asia/Bangkok)

## เป้าหมาย

ให้การเลือกหุ้นจากกรอบใดกรอบหนึ่งสะท้อนในทุกแผงที่ใช้ Symbol เดียวกัน

## Behavior

- Technical Indicators, Buy Engine และ Price History ใช้ `selectedSymbol` ร่วมกัน
- เลือกหุ้นจากกรอบใดกรอบหนึ่งแล้วอีกสองกรอบเปลี่ยนตามทันที
- เปลี่ยน Portfolio แล้วเลือกหุ้นตัวแรกของ Portfolio ใหม่โดยอัตโนมัติ
- ป้องกันไม่ให้ Symbol จาก Port เดิมค้างอยู่ใน Port ใหม่

## Safety boundary

- ไม่เปลี่ยน scoring, zone, budget หรือ transaction logic
- ไม่เพิ่ม API calls นอกเหนือจากการโหลดข้อมูลของ Symbol ที่เลือก

## Verification

- Unit tests: 34/34 ผ่าน
- ESLint: ผ่าน
- TypeScript: ผ่าน
- Next.js production build: ผ่าน

จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
