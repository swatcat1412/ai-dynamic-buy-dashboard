# AI Dynamic Buy Dashboard

Version: 1.2

## วัตถุประสงค์

ระบบวิเคราะห์หุ้นสหรัฐฯ เพื่อช่วยตัดสินใจทยอยสะสม (Dynamic Buy Zone)

## Portfolio

  Symbol     Weight
  -------- --------
  GOOGL       12.5%
  LLY           15%
  JEPQ          25%
  TSM         12.5%
  VRT           10%
  MSFT         7.5%
  PG          12.5%
  RKLB           5%

## Market Score

-   Fed
-   Inflation
-   AI Trend
-   VIX
-   Nasdaq
-   Bond Yield

## Dynamic Buy Zones

ระบบปัจจุบันคำนวณ Zone A-E รายวันจากราคาปิด, EMA20, แนวรับ 20/60 วัน และ ATR สำหรับหุ้นที่เปิดใช้งานทั้ง 8 ตัว รายการด้านล่างเป็น Legacy v1 reference ที่เก็บไว้เพื่อประวัติเท่านั้น

### RKLB

-   Zone A \>75 : WAIT
-   Zone B 68-72 : Buy 20%
-   Zone C 62-67 : Buy 35%
-   Zone D 56-61 : Buy 30%
-   Zone E \<56 : Buy Remaining

### GOOGL

-   Zone A \>205 : WAIT
-   Zone B 195-205 : Buy 20%
-   Zone C 185-195 : Buy 35%
-   Zone D 175-185 : Buy 30%
-   Zone E \<175 : Buy Remaining

### LLY

-   Zone A \>900 : WAIT
-   Zone B 850-900 : Buy 20%
-   Zone C 800-850 : Buy 35%
-   Zone D 740-800 : Buy 30%
-   Zone E \<740 : Buy Remaining

### JEPQ

-   Zone A \>58 : WAIT
-   Zone B 57-58 : Buy 20%
-   Zone C 55-56 : Buy 35%
-   Zone D 53-54 : Buy 30%
-   Zone E \<52 : Buy Remaining

## Technical Indicators

-   RSI
-   MACD
-   EMA20/50/200
-   Volume
-   ATR
-   ADX
-   OBV

## Macro Indicators

-   Fed
-   10Y Treasury
-   DXY
-   VIX
-   Fear & Greed
-   Nasdaq
-   S&P500

## Buy Engine

-   RSI \<35 = +20
-   MACD Golden Cross = +20
-   Volume \> Avg = +10
-   Fear & Greed \<25 = +20
-   VIX \>22 = +15
-   Price at Support = +15

## Daily Checklist

-   Nasdaq
-   VIX
-   Bond Yield
-   DXY
-   Earnings
-   RSI
-   MACD
-   Buy Zone

## Daily Workflow Journal

-   ใช้วันที่ปฏิทิน Asia/Bangkok
-   บันทึกแยกตาม Date + Symbol และ update รายการเดิมเพื่อป้องกันข้อมูลซ้ำ
-   เก็บ Checklist, Manual Decision, Note, Reference Price และ Market Date
-   แสดงประวัติย้อนหลังและ Outcome เทียบกับราคาล่าสุด
-   ผู้ใช้ที่ยังไม่ล็อกอินเก็บข้อมูลใน Browser เป็น fallback
-   ผู้ใช้ที่ล็อกอินด้วย Supabase Email Magic Link สามารถ sync ข้ามอุปกรณ์ได้
-   ตาราง cloud ใช้ RLS ผูกทุก operation กับ `auth.uid()` และไม่เปิดสิทธิ์ให้ `anon`
-   กราฟราคารองรับ 5/30/60/120/260 วัน

## Private Journal Sync

-   ใช้ publishable key ใน browser; ห้ามส่ง Supabase secret/service key ไป client
-   merge local/cloud โดยเลือก record ล่าสุดของ Date + Symbol
-   local journal ยังใช้งานได้เมื่อ Auth หรือ network ไม่พร้อม
-   Environment: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

------------------------------------------------------------------------

จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.

