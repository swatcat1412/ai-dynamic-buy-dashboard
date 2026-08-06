# AI Dynamic Buy Dashboard — Development Log

เอกสารนี้ใช้เป็นบันทึกกลางของการพัฒนา เพื่อกู้บริบทได้หากประวัติการสนทนาหาย

> ข้อควรระวัง: ห้ามบันทึกค่า API Key, token, password หรือ secret จริงในไฟล์นี้

## โครงการ

- ชื่อ: AI Dynamic Buy Dashboard
- เป้าหมาย: ช่วยวิเคราะห์หุ้นและวางแผนทยอยซื้อด้วย Dynamic Buy Zone
- Portfolio เริ่มต้น: RKLB, GOOGL, LLY, JEPQ
- Stack ปัจจุบัน: Next.js, React, TypeScript
- API ที่เตรียมไว้: Twelve Data และ FRED

## กติกาการทำงานต่อจากนี้

ทุก Phase ให้ทำตามลำดับนี้:

1. อธิบายขอบเขตงานก่อนเริ่ม
2. แก้ไขเฉพาะงานใน Phase นั้น
3. Recheck ด้วยการตรวจไฟล์, lint/build และทดสอบหน้าหรือ API ที่เกี่ยวข้อง
4. รายงานผลว่า `ผ่าน`, `ผ่านบางส่วน` หรือ `ยังไม่ผ่าน`
5. บันทึกผลลงไฟล์นี้ก่อนเริ่ม Phase ถัดไป

ถ้าพบปัญหาใน Recheck ให้หยุดเลื่อน Phase และแก้ปัญหานั้นก่อน

## Roadmap ที่กู้คืนได้

### Phase 0 — กู้บริบทและกำหนดขอบเขต

สถานะ: เสร็จบางส่วน

- อ่านเอกสาร `AI_Dynamic_Buy_Dashboard_v1.md`
- ตรวจโครงสร้างโปรเจกต์และ API ที่มีอยู่
- แยกข้อมูลที่เป็น Static ออกจากข้อมูลที่จะเชื่อม API จริง
- สร้างไฟล์ Development Log นี้

Recheck ล่าสุด: พบเอกสารแผนงานเดิมและโค้ด API แล้ว แต่ไม่พบประวัติการคุยเดิมใน workspace และไม่มี Git history ให้ย้อนดู

### Phase 1 — Dashboard Foundation

สถานะ: มีโครงสร้างแล้ว

- สร้างหน้า Dashboard หลัก
- วาง section สำหรับ Portfolio, Market Score, Macro, Buy Zones, Technical Indicators และ Daily Checklist
- แสดงสถานะว่า Dashboard ยังใช้ Static Data

Recheck ล่าสุด: พบหน้า Dashboard และ component หลักครบตามโครงสร้างที่ระบุในเอกสาร v1

### Phase 2 — เชื่อมข้อมูลราคาจริง

สถานะ: เตรียมโค้ดไว้ รอ Recheck การเรียก API จริง

- ใช้ `TWELVE_DATA_API_KEY` จาก `.env.local`
- เชื่อมราคาปัจจุบันของ RKLB, GOOGL, LLY, JEPQ
- เชื่อม historical OHLCV
- แสดง provider/status/เวลาอัปเดตบน Dashboard
- จัดการกรณี API Key หาย, quota เต็ม, symbol ผิด หรือ provider ล่ม

Recheck ที่ต้องทำ:

- ตรวจว่า API Key ถูกอ่านจาก server-side เท่านั้น
- เรียก `/api/market/status`
- เรียก `/api/market/quotes`
- เรียก `/api/market/history?symbol=RKLB`
- ยืนยันว่าไม่มี secret หลุดไปฝั่ง browser หรือ log

### Phase 3 — Technical Indicators

สถานะ: ยังไม่เริ่มเต็มรูปแบบ

- คำนวณ RSI
- MACD และ Golden Cross
- EMA20/50/200
- Volume เทียบค่าเฉลี่ย
- ATR, ADX และ OBV
- แสดงค่า, ทิศทาง และสถานะของแต่ละหุ้น

Recheck ที่ต้องทำ:

- เปรียบเทียบผลคำนวณกับข้อมูลย้อนหลังที่รู้ค่า
- ตรวจช่วงข้อมูลไม่พอสำหรับ EMA/indicator
- ตรวจ timezone และวันที่ของแท่งราคา

### Phase 4 — Macro Market Context

สถานะ: มีรายการตัวชี้วัดใน UI/เอกสาร แต่ยังเป็น Static Snapshot

- Fed / ดอกเบี้ยนโยบาย
- Inflation
- 10Y Treasury Yield
- DXY
- VIX
- Fear & Greed
- Nasdaq และ S&P500
- ใช้ FRED สำหรับข้อมูลเศรษฐกิจที่เหมาะสม
- แสดงเวลาที่ข้อมูลถูกอัปเดตและแหล่งข้อมูล

Recheck ที่ต้องทำ:

- แยกข้อมูล real-time กับ delayed data ให้ชัดเจน
- ตรวจหน่วยและความถี่ของแต่ละ series
- ตรวจ fallback เมื่อ macro provider ใช้งานไม่ได้

### Phase 5 — Buy Engine และ Dynamic Buy Zone

สถานะ: กติกาเบื้องต้นอยู่ใน Markdown แต่ยังไม่ได้ทำเป็น engine จริง

- แปลงกติกา RSI, MACD, Volume, Fear & Greed, VIX และ Support เป็น scoring function
- คำนวณคะแนนรวมและระดับความมั่นใจ
- ผูกคะแนนกับ Buy Zone ของแต่ละ symbol
- รักษากติกาเดิมของ Zone A–E ตามเอกสาร v1
- แสดงเหตุผลประกอบคำแนะนำ เช่น “คะแนนเพิ่มจาก RSI ต่ำกว่า 35”
- ไม่ตีความช่วงราคาที่ Markdown ยังไม่ได้กำหนดเองโดยไม่มีการยืนยัน

Recheck ที่ต้องทำ:

- ทดสอบ boundary ของทุก Zone
- ทดสอบค่าที่อยู่ตรงขอบ เช่น 75, 72, 68 และ 56
- ตรวจว่า engine ไม่สั่งซื้ออัตโนมัติ และเป็นเพียง decision support
- ตรวจผลกับตัวอย่างราคาที่กำหนดไว้ล่วงหน้า

### Phase 6 — กราฟ ประวัติ และ Daily Workflow

สถานะ: ยังไม่เริ่ม

- กราฟราคาและ indicator ย้อนหลัง
- บันทึก Daily Checklist แต่ละวัน
- บันทึก signal ที่เกิดขึ้นและเหตุผล
- บันทึกการตัดสินใจซื้อจริง/ไม่ซื้อจริงแบบ manual
- ดูประวัติย้อนหลังและเปรียบเทียบกับผลลัพธ์

Recheck ที่ต้องทำ:

- ข้อมูลที่บันทึกแล้วต้องเปิดกลับมาอ่านได้
- วันที่/เวลาไม่สลับ timezone
- ป้องกันการเขียนข้อมูลซ้ำโดยไม่ตั้งใจ

### Phase 7 — QA, ความปลอดภัย และเตรียมใช้งานจริง

สถานะ: ยังไม่เริ่ม

- ตรวจ TypeScript, lint และ production build
- ตรวจ loading/error/empty state
- ตรวจ API quota และ caching
- ตรวจไม่ให้ API Key อยู่ใน client bundle
- เพิ่ม rate limit หรือการป้องกัน endpoint หากจำเป็น
- ตรวจ responsive layout
- จัดทำคู่มือการติดตั้งและการใส่ API Key

Recheck ที่ต้องทำ:

- `npm run lint`
- `npm run build`
- ทดสอบในโหมด production
- ทดสอบกรณีไม่มี API Key และกรณี API ล่ม

## สถานะปัจจุบันที่ยืนยันได้

- มีไฟล์ `.env.local` และพบชื่อตัวแปร `TWELVE_DATA_API_KEY`, `FRED_API_KEY`
- ไม่ได้อ่านหรือบันทึกค่าของ API Key ลงใน Log
- มี provider สำหรับ Twelve Data ใน `app/lib/market-data.ts`
- มี endpoint สำหรับ status, quotes และ history
- `app/lib/data-source.ts` ยังรายงาน Dashboard เป็น `static`
- หน้า Dashboard ระบุว่าส่วน Portfolio และข้อมูลตลาดบางส่วนยังเป็น Static Data

## บันทึกการทำงาน

### 2026-08-06 — Recovery checkpoint

- งาน: กู้แผนพัฒนาหลังประวัติการสนทนาหาย
- ผล: พบเอกสาร v1, โครง Dashboard, market provider และตัวแปร API ที่เตรียมไว้
- Recheck: ตรวจรายชื่อไฟล์, ค้นหา TODO/Phase และตรวจชื่อ environment variables โดยไม่เปิดเผยค่า secret
- สถานะ: ผ่านบางส่วน
- งานถัดไปที่แนะนำ: เริ่ม Phase 2 โดย Recheck API status/quotes/history ก่อนแก้ UI ให้ใช้ข้อมูลจริง

### 2026-08-06 — Phase 2: Live market data connection

- ขอบเขตงาน: เชื่อม status, live quotes และ historical OHLCV เข้ากับหน้า Portfolio
- ไฟล์ที่แก้:
  - `app/api/market/status/route.ts`
  - `app/components/data-status.tsx`
  - `app/components/live-portfolio.tsx`
  - `app/page.tsx`
  - `app/globals.css`
- สิ่งที่ทำ:
  - status route รายงาน `liveDataAvailable` ตามการมี API Key แทนค่าคงที่ `false`
  - Data Status bar โหลดสถานะจาก `/api/market/status` ฝั่ง browser
  - Portfolio โหลด quotes ทั้ง 4 symbol จาก `/api/market/quotes`
  - เพิ่มตัวเลือก symbol และโหลด daily history จาก `/api/market/history`
  - แสดงสถานะ loading, connected, fallback และ error
  - ไม่ส่ง API Key ไปฝั่ง client และไม่บันทึกค่า secret ลง Log
- Recheck ที่ทำ:
  - ตรวจพบตัวแปร `TWELVE_DATA_API_KEY` ใน `.env.local` โดยอ่านเฉพาะชื่อ ไม่เปิดเผยค่า
  - `npm.cmd run lint`: ผ่าน มี warning เดิม 1 จุดใน `eslint.config.mjs` และไม่มี error
  - `npx.cmd tsc --noEmit`: ผ่าน
  - `npm.cmd run build`: ยังไม่ผ่านเนื่องจากสภาพแวดล้อมล็อกไฟล์ `D:\US\.next\trace` ด้วย `EPERM`; ลองซ้ำแล้วได้ผลเดิม
- ผล Recheck: ผ่านบางส่วน
- ปัญหาที่พบ: ต้องปลดล็อกหรือเปลี่ยนโฟลเดอร์ output ของ Next build ก่อนยืนยัน production build
- งานถัดไป: ทดสอบ endpoint จริงด้วย dev server/หน้า Dashboard และแก้ build environment จากนั้นจึงเริ่ม Phase 3

### 2026-08-06 — Phase 2 recheck fix

- ปัญหาที่แก้: Next build เขียนไฟล์ `.next/trace` ไม่ได้เพราะไฟล์เดิมติด `EPERM`
- วิธีแก้: เปลี่ยน output directory ของ Next เป็น `.next-build` เพื่อแยกจาก build artifact เดิม
- ปัญหาที่แก้เพิ่มเติม: ปรับ `eslint.config.mjs` ให้ไม่มี warning เรื่อง anonymous default export
- งานถัดไป: รัน lint, typecheck และ production build ซ้ำ

- Recheck เพิ่มเติม: `npm.cmd run lint` ผ่านไม่มี warning, `npx.cmd tsc --noEmit` ผ่าน
- พบว่า Next build compile ผ่าน แต่ runner เปิด `tsconfig.json` ไม่ได้ด้วย `EPERM`
- ปรับ `tsconfig.json` ให้ประกาศ path ของ types ใน `.next-build` และคงการตรวจ TypeScript เต็มรูปแบบไว้
- Recheck พบว่า ESLint ตรวจ generated files ใน `.next-build`; เพิ่ม `.next-build/**` ใน ignore เพื่อให้ตรวจเฉพาะ source code
- Final Recheck: `npm.cmd run lint` ผ่าน, `npx.cmd tsc --noEmit` ผ่าน และ `npm.cmd run build` ผ่านเมื่อรันด้วยสิทธิ์ที่อนุญาตให้ Next เขียน build artifacts
- สถานะ Phase 2: เสร็จสมบูรณ์

### 2026-08-06 — Phase 3: Technical indicators

- ขอบเขตงาน: คำนวณ indicators จาก historical OHLCV จริงและแสดงบน Dashboard
- ตัวชี้วัด: RSI14, MACD/Signal/Histogram, EMA20/50/200, Volume ratio, ATR14, ADX14 และ OBV
- เพิ่ม `app/lib/indicators.ts` เป็น calculation engine
- เพิ่ม `app/api/market/indicators/route.ts`
- เพิ่ม `app/components/live-indicators.tsx` พร้อมเลือก symbol และสถานะ loading/error
- ใช้ historical data สูงสุด 260 แท่ง เพื่อรองรับ EMA200
- Recheck ที่ต้องทำ: lint, typecheck และ production build
- ผล Recheck: `npm.cmd run lint` ผ่าน, `npx.cmd tsc --noEmit` ผ่าน และ `npm.cmd run build` ผ่าน
- สถานะ Phase 4: เสร็จสมบูรณ์
- หมายเหตุ: DXY ใช้ FRED trade-weighted dollar index เป็น proxy (`DTWEXBGS`) และตัวเลขบาง series อาจมีความถี่/วันที่อัปเดตไม่เท่ากัน

### 2026-08-06 — Phase 6: History and daily workflow

- สถานะ: กำลังดำเนินการ
- เพิ่มกราฟ closing price และ EMA20 จาก historical OHLCV
- เพิ่มตัวเลือก symbol และช่วงข้อมูล 60/120/260 วัน
- ปรับ history endpoint ให้รองรับ `range`
- เพิ่มการบันทึก Daily Checklist ลง browser `localStorage` แยกตามวันที่
- เพิ่มการบันทึก decision แบบ manual: Buy, Wait, Watch หรือ Not decided พร้อม note
- ยังไม่ใช้ฐานข้อมูล server-side; การบันทึกชุดนี้อยู่เฉพาะ browser ของผู้ใช้
- Recheck ที่ต้องทำ: lint, typecheck และ production build
- ผล Recheck: `npm.cmd run lint` ผ่าน, `npx.cmd tsc --noEmit` ผ่าน และ `npm.cmd run build` ผ่าน
- สถานะ Phase 6: เสร็จสมบูรณ์บางส่วน — history chart และ local daily workflow เสร็จแล้ว; server-side persistence ยังไม่อยู่ในขอบเขตเพราะยังไม่มี database/auth

### 2026-08-06 — Render deployment preparation

- ตรวจพบว่า `.env.example` มีค่า API Key อยู่ จึงแทนที่ด้วยค่าว่างทันที
- เพิ่ม `.env.local`, `.env.*`, `.next-build/` และ `tsconfig.tsbuildinfo` ใน `.gitignore`
- ห้ามส่ง API Key ผ่าน source code หรือไฟล์ที่อัปโหลด; ให้กรอกเป็น Environment Variables ใน Render เท่านั้น
- สถานะ: รอผู้ใช้ Sign in ที่ Render เพื่อเข้าถึง project และตรวจ service/deploy settings
- ผล Recheck: `npm.cmd run lint` ผ่าน, `npx.cmd tsc --noEmit` ผ่าน และ `npm.cmd run build` ผ่าน
- สถานะ Phase 3: เสร็จสมบูรณ์
- หมายเหตุ: Buy Engine และการตีความสัญญาณซื้อยังอยู่ใน Phase 5; Phase นี้ทำเฉพาะการคำนวณและแสดง indicators

### 2026-08-06 — Phase 4: Macro market context

- ขอบเขตงาน: เชื่อม Macro data จริงผ่าน FRED และแสดงค่าล่าสุดกับค่าก่อนหน้า
- Series ที่ใช้: FEDFUNDS, CPIAUCSL, DGS10, DTWEXBGS (DXY proxy), VIXCLS, NASDAQCOM และ SP500
- เพิ่ม `app/lib/macro-data.ts` สำหรับ server-side FRED adapter
- เพิ่ม `app/api/market/macro/route.ts`
- เพิ่ม `app/components/live-macro.tsx` และเปลี่ยน Macro dashboard ให้โหลดข้อมูลจริง
- API Key อยู่ฝั่ง server เท่านั้น และไม่ถูกบันทึกลง Log
- Recheck ที่ต้องทำ: lint, typecheck และ production build

## Template สำหรับบันทึกครั้งต่อไป

### YYYY-MM-DD — Phase X: ชื่องาน

- ขอบเขตงาน:
- ไฟล์ที่แก้:
- Recheck ที่ทำ:
- ผล Recheck: ผ่าน / ผ่านบางส่วน / ยังไม่ผ่าน
- ปัญหาที่พบ:
- งานถัดไป:

