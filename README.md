# Northern Health 1

เว็บแสดงข้อมูลสุขภาพและฐานข้อมูล Supabase สำหรับโครงการ Northern Health.

## ฟีเจอร์หลัก
- หน้าแสดงข้อมูลสุขภาพและรายงานต่าง ๆ
- บันทึกข้อมูลผ่าน Supabase
- มี keepalive endpoint เพื่อป้องกัน Supabase ไม่ถูก deactivate

## Keepalive
- มี endpoint ที่เรียกผ่าน Vercel cron ทุก 5 นาที
- Endpoint: `/api/keepalive`
- ต้องตั้งค่าตัวแปร環ข้างใน Vercel:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Deploy บน Vercel
1. Push โค้ดขึ้น GitHub
2. Import โปรเจกต์ลง Vercel
3. ตั้งค่า environment variables ตามด้านบน
4. Deploy ใหม่

## Development
- เปิดไฟล์ HTML โดยตรงในเบราว์เซอร์ได้
- หากต้องการทดสอบ keepalive ให้เปิด `/api/keepalive`
