# AI Dynamic Buy Dashboard V2 — Phase 1 Foundation

วันที่เริ่ม: 4 กันยายน 2026 (Asia/Bangkok)

## เป้าหมาย

วางแกนกลางของ V2 ให้รองรับพฤติกรรมซื้อจริง 1–3 ครั้งต่อเดือน โดยแยก Strategy ออกจาก Market Data API และ Buy Engine เดิมก่อนเชื่อมคะแนนแบบ Dynamic ใน Phase ถัดไป

## Source gap และ Assumption

ไฟล์ `AI_Dynamic_Buy_Dashboard_V2_Upgrade_Plan.md` จากบทสนทนาต้นทางไม่ได้ถูก sync เข้ามาใน checkout จึงใช้รายละเอียดที่กู้คืนได้จากบทสนทนาเป็นขอบเขต Phase 1:

- Port 1 — Growth + Income: `JEPQ, GOOGL, LLY, RKLB, VRT`
- Port 2 — Dividend Growth + Defensive: `DGRO, VIG, O, KO, PG`
- ซื้อไม่เกิน 3 ครั้งต่อเดือน: Starter 25%, Pullback 30%, Correction 45%
- Correction Multiplier: Normal 0.5×, Pullback 1×, Correction 1.5×, Major Correction 1.75×, Panic 2×
- เงินที่ไม่ใช้ให้ทบเป็น Correction Reserve

## สิ่งที่ Phase 1 ทำ

- เพิ่ม central V2 strategy registry สำหรับสองพอร์ต
- เพิ่ม pure functions สำหรับแบ่ง monthly bullets, คำนวณ reserve และจัดระดับ market drawdown
- เพิ่มหน้า Strategy Foundation ให้เห็นโครงสร้าง 2 Port และ 3 Bullets
- เพิ่ม unit tests สำหรับ budget integrity, boundary ของ correction และ portfolio uniqueness

## Safety boundary

- ไม่เพิ่ม `DGRO/VIG/O/KO` เข้า `portfolioSymbols` ใน Phase นี้ เพื่อไม่เพิ่ม Twelve Data usage จาก 8 เป็น 12 credits ต่อ cold refresh
- ไม่เปลี่ยน Buy Engine score, Dynamic Price Zones หรือ recommendation ที่ production ใช้อยู่
- ไม่เขียน Supabase, ไม่สร้าง schema และไม่บันทึกประวัติการซื้อ
- ตัวเลข 25/30/45 เป็นสัดส่วนของ monthly budget ไม่ใช่คำสั่งซื้ออัตโนมัติ

## Gate ก่อน Phase 2

1. ยืนยันรายชื่อหุ้นและสัดส่วนเป้าหมายภายในแต่ละพอร์ต
2. เลือกว่าจะ fetch quote แบบ on-demand หรือแยก refresh schedule เพื่อไม่ชน Twelve Data Basic quota
3. กำหนด source of truth สำหรับ monthly budget, used bullets และ Correction Reserve
4. ผ่าน tests, lint, typecheck, production build และ browser QA — **ผ่านแล้วใน local branch**

## Verification result

- Unit tests: 28/28 ผ่าน
- ESLint: ผ่าน
- TypeScript: ผ่าน
- Next.js production build: ผ่าน
- Browser QA: desktop และ mobile 390×844 ผ่าน, ไม่พบ horizontal page overflow หรือ console error
- Local no-secret behavior: status 200 และ market routes ที่ต้องใช้ provider ปิดอย่างชัดเจนด้วย 503 ตาม contract

จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
