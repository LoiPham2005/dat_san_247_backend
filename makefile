kiểm tra số lượng entity:
 Get-ChildItem -Path src -Recurse -Filter "*.entity.ts" | Measure-Object

kiểm tra số lượng controller:
 Get-ChildItem -Path src -Recurse -Filter "*.controller.ts" | Measure-Object

kiểm tra số lượng service:
 Get-ChildItem -Path src -Recurse -Filter "*.service.ts" | Measure-Object

kiểm tra số lượng module:
 Get-ChildItem -Path src -Recurse -Filter "*.module.ts" | Measure-Object

kiểm tra số lượng model prisma:
Select-String "^model\s" prisma\schema.prisma | Measure-Object

kiểm tra số lượng enum prisma:
Select-String "^enum\s" prisma\schema.prisma | Measure-Object

kiểm tra số lượng mdel trong prisma/schema:
Select-String "^model\s" prisma\schema\*.prisma | Measure-Object  

liệt kê tên model trong prisma/schema:
Select-String "^model\s+(\w+)" prisma\schema\*.prisma | ForEach-Object { $_.Matches.Groups[1].Value }

câu lệnh pull db trên cloud trên db về:
npx.cmd prisma introspect

câu lệnh push db lên cloud:
npx prisma db push

Để Test QUA INTERNET (Công khai ra ngoài tạm thời):
npx localtunnel --port 3001

Để lấy IP Public của máy:
https://ipv4.icanhazip.com/

Để Test QUA INTERNET (Công khai ra ngoài tạm thời):
ssh -R 80:localhost:3001 nokey@localhost.run
hoặc
ssh -R 80:127.0.0.1:3001 nokey@localhost.run

câu lệch chạy redis docker:
docker run -d --name dat-san-redis -p 6379:6379 redis:alpine

câu lệnh tắt node:
taskkill /F /IM node.exe





Giai đoạn đầu (MVP): Dùng Email + Google Apps Script — làm trong 1 buổi, không tốn tiền, đủ dùng.

Khi có người dùng thật: Nâng lên SMS → Telegram Bot vì realtime hơn.



Các giải pháp miễn phí thực tế
Giải pháp 1: Email ngân hàng + Google Apps Script (Miễn phí 100%)
Hầu hết ngân hàng VN đều gửi email mỗi khi có giao dịch.


Tiền vào TK → Ngân hàng gửi email → Gmail
→ Google Apps Script đọc email (chạy mỗi 1 phút)
→ Parse nội dung chuyển khoản
→ Gọi webhook vào backend của bạn
→ Backend confirm booking
Chi phí: 0đ — Gmail miễn phí, Google Apps Script miễn phí.

Nhược điểm: Delay 1-2 phút thay vì vài giây.

Giải pháp 2: SMS → Telegram Bot (Miễn phí 100%)

Tiền vào TK → Bank gửi SMS → Android app forward lên Telegram Bot
→ Telegram Bot gọi webhook vào backend
→ Backend confirm booking
Cần 1 điện thoại Android cài app SMS Forwarder (miễn phí trên CH Play), để online 24/7.

Chi phí: 0đ — Telegram Bot miễn phí, chỉ tốn điện thoại cũ để chạy.

Giải pháp 3: AI đọc ảnh screenshot (Gemini free tier)
Bạn hỏi đúng hướng — Gemini API có free tier 1500 requests/ngày, đủ cho app nhỏ.


User chụp màn hình app ngân hàng sau khi chuyển
→ Upload lên app
→ Backend gửi ảnh cho Gemini
→ Gemini trả về: số tiền, nội dung CK, thời gian, ngân hàng
→ Backend cross-check với booking
→ Confirm nếu khớp
Nhưng vấn đề lớn: Ảnh có thể bị chỉnh sửa bằng Photoshop/app fake screenshot. Gemini không phân biệt được ảnh thật hay giả nếu làm khéo.

Cách giảm rủi ro fake:

Yêu cầu user upload video quay màn hình thay vì ảnh tĩnh — khó fake hơn nhiều
Check metadata EXIF của ảnh (thời gian chụp phải gần với thời điểm booking)
Chỉ cho phép amount sai lệch ≤ 0đ (không chấp nhận thiếu)
So sánh
Giải pháp	Chi phí	Tự động	Độ tin cậy	Độ khó làm
Email + Apps Script	0đ	✅ 95%	Cao	Dễ
SMS → Telegram Bot	0đ	✅ 99%	Cao	Trung bình
AI đọc screenshot	0đ	⚠️ 80%	Trung bình (có thể fake)	Trung bình
