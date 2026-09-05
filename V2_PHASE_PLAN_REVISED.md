# AI Dynamic Buy Dashboard V2 — Revised Phase Plan

วันที่ปรับแผน: 5 กันยายน 2026 (Asia/Bangkok)

## Scope decision

ตัด **Market News / Catalysts / Marketaux** ออกจาก production scope แล้ว เนื่องจากไม่ใช่ข้อมูลหลักที่จำเป็นต่อ monthly buy decision และเพิ่มภาระเรื่อง token, quota, cache และการตีความ sentiment โดยไม่เพิ่มความแน่นอนของ Buy Engine อย่างเพียงพอ

การตัดครั้งนี้ไม่กระทบราคา, macro, indicators, scoring, zones, portfolio หรือ THB planner

## สถานะ Phase เดิม

- Phase 0–2: audit, strategy foundation และ market opportunity — เสร็จ
- Phase 3–5: portfolio selector, stock scoring และ THB budget — เสร็จ
- Phase 6–8: portfolio-aware zones, analytics และ Zone B fix — เสร็จ
- Phase 9–10: production acceptance และ shared symbol selection — เสร็จ
- News component/API ถูกถอดจากหน้า production และไม่อยู่ใน roadmap ต่อไป

## แผน Phase ใหม่

### Phase 11 — Readability & Information Hierarchy

- เพิ่ม contrast ของ price range, table header, metadata และ macro status
- ปรับขนาด/น้ำหนักตัวอักษรที่เป็นข้อมูลสำคัญ
- รักษา visual hierarchy เดิมและตรวจ desktop/mobile
- ไม่เปลี่ยน calculation หรือ recommendation logic

### Phase 12 — Production Data Reliability

- ตรวจ status, quotes, history, indicators และ buy-engine ใน production
- ตรวจ timeout, retry, stale cache และ quota telemetry
- เพิ่ม endpoint contract checks โดยไม่เปิดเผย secrets
- ยืนยันว่า API failure แสดงสถานะชัดเจน ไม่กลายเป็นข้อมูลว่างที่ทำให้เข้าใจผิด

### Phase 13 — Scoring Calibration

- ตรวจน้ำหนัก Stock Opportunity และ Market Multiplier
- ทดสอบ boundary ของ score, zone และ correction multiplier
- แยก data unavailable ออกจาก score ต่ำ
- ไม่เพิ่ม signal ที่ไม่มีข้อมูลรองรับ

### Phase 14 — Monthly Decision Workflow

- ตรวจ Starter / Pullback / Correction 25/30/45%
- ตรวจ THB planner หลายระดับงบ
- ตรวจ unused reserve และการใช้เงินไม่เกิน 3 ครั้งต่อเดือน
- แสดงเหตุผลการตัดสินใจให้สอดคล้องกับ score และ zone

### Phase 15 — Final Acceptance & Maintenance

- สร้าง production acceptance checklist ฉบับสุดท้าย
- ทดสอบ Port 1/Port 2 และ shared symbol selection
- ตรวจ regression tests, lint, typecheck, build และ deployment
- สรุป runbook สำหรับ API quota, cache และ rollback

## หลักการหลังปรับแผน

ระบบยังเป็น **decision support** เท่านั้น ไม่มี auto-order และไม่มี transaction persistence เพิ่มเติม

ทุก Phase หลังจากนี้ต้องแยกเป็น branch, ผ่าน local quality gate และตรวจ Preview ก่อน merge เข้า `main`

จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
