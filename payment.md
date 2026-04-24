
vietQR + sepay
Để hoạt động thật, bạn cần làm thêm:

Đăng ký SePay tại sepay.vn → liên kết tài khoản ngân hàng → lấy API key
Set .env: SEPAY_API_KEY=your_key
Webhook URL trên SePay dashboard: https://your-domain.com/payments/webhook/sepay
Local test: dùng ngrok → ngrok http 3001 → paste URL vào SePay
Xóa account ngân hàng cũ sai code → thêm lại bằng dropdown mới