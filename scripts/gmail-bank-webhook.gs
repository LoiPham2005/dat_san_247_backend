/**
 * Google Apps Script — Tự động đọc email ngân hàng và gọi webhook DatSan247
 *
 * CÁCH CÀI ĐẶT:
 * 1. Vào https://script.google.com → New project
 * 2. Paste toàn bộ file này vào
 * 3. Sửa các biến CONFIG bên dưới
 * 4. Chạy setupTrigger() một lần để tạo trigger tự động
 * 5. Cấp quyền Gmail khi Google hỏi
 *
 * CÁCH HOẠT ĐỘNG:
 * - Cứ mỗi 1 phút, script chạy và đọc email ngân hàng chưa xử lý
 * - Parse số tiền + nội dung chuyển khoản
 * - Tìm booking_code trong nội dung (format: BK + 6 ký tự, vd: BKAB1234)
 * - Gọi webhook vào backend để confirm booking
 */

// ============================================================
// CẤU HÌNH — SỬA TRƯỚC KHI CHẠY
// ============================================================
var CONFIG = {
  WEBHOOK_URL: 'http://localhost:3001/api/v1/payments/webhook/bank-email', // Thay bằng domain thật khi deploy
  WEBHOOK_SECRET: 'datsan247_webhook_secret',    // Phải khớp với WEBHOOK_SECRET trong backend .env
  GMAIL_SEARCH_QUERY: 'from:(vcb@vietcombank.com.vn OR notify@vietcombank.com.vn OR no-reply@vcb.com.vn) is:unread',
  PROCESSED_LABEL: 'DatSan247_Processed',        // Label Gmail để đánh dấu email đã xử lý
  BOOKING_CODE_PATTERN: /BK[A-Z0-9]{4,8}/i,      // Regex tìm booking code trong nội dung CK
  AMOUNT_PATTERNS: [
    /[Ss][Oo]\s*[Tt][Ii][Ee][Nn]\s*[:=]\s*([\d,\.]+)/,   // "So tien: 150,000"
    /[Ss][Oo] [Tt][Ii][Ee][Nn]\s+([\d,\.]+)/,             // "So tien 150000"
    /([Cc][Rr][Ee][Dd][Ii][Tt]|[Tt][Hh][Uu])\s*[:\-]?\s*([\d,\.]+)/,  // "CREDIT: 150,000"
    /\+([\d,\.]+)\s*VND/i,                                  // "+150,000 VND"
    /([\d,\.]+)\s*đ/,                                       // "150,000đ"
  ],
};
// ============================================================

/**
 * Hàm chính — được trigger tự động mỗi 1 phút
 */
function checkBankEmails() {
  var label = getOrCreateLabel(CONFIG.PROCESSED_LABEL);
  var threads = GmailApp.search(CONFIG.GMAIL_SEARCH_QUERY, 0, 20);

  if (threads.length === 0) return;

  Logger.log('Tìm thấy ' + threads.length + ' email chưa xử lý');

  threads.forEach(function(thread) {
    var messages = thread.getMessages();
    messages.forEach(function(message) {
      if (!message.isUnread()) return;

      var subject = message.getSubject();
      var body = message.getPlainBody() || message.getBody();
      var date = message.getDate();

      Logger.log('Xử lý email: ' + subject);

      var parsed = parseTransactionEmail(subject, body);

      if (parsed) {
        Logger.log('Tìm thấy giao dịch: booking=' + parsed.booking_code + ' amount=' + parsed.amount);
        callWebhook(parsed, date);
      } else {
        Logger.log('Không match booking code trong email này');
      }

      // Đánh dấu đã xử lý bất kể có match hay không
      message.markRead();
      thread.addLabel(label);
    });
  });
}

/**
 * Parse email lấy booking_code + amount
 */
function parseTransactionEmail(subject, body) {
  var text = subject + ' ' + body;

  // Tìm booking code
  var bookingMatch = text.match(CONFIG.BOOKING_CODE_PATTERN);
  if (!bookingMatch) return null;

  var bookingCode = bookingMatch[0].toUpperCase();

  // Tìm số tiền
  var amount = extractAmount(text);
  if (!amount || amount <= 0) return null;

  // Lấy transaction ID nếu có (tùy ngân hàng)
  var txnId = null;
  var txnMatch = text.match(/[Mm][Ãã]\s*[Gg][Dd]\s*[:=]?\s*([A-Z0-9]{8,20})/i);
  if (txnMatch) txnId = txnMatch[1];

  return {
    booking_code: bookingCode,
    amount: amount,
    bank_name: detectBank(subject + body),
    transaction_id: txnId,
    transaction_time: new Date().toISOString(),
    raw_description: text.substring(0, 500),
  };
}

function extractAmount(text) {
  for (var i = 0; i < CONFIG.AMOUNT_PATTERNS.length; i++) {
    var match = text.match(CONFIG.AMOUNT_PATTERNS[i]);
    if (match) {
      var raw = match[match.length - 1]; // lấy group cuối
      var cleaned = raw.replace(/[,\.]/g, '').replace(/\s/g, '');
      var num = parseInt(cleaned, 10);
      if (num > 1000) return num; // bỏ qua số quá nhỏ
    }
  }
  return null;
}

function detectBank(text) {
  if (/vietcombank|vcb/i.test(text)) return 'Vietcombank';
  if (/techcombank|tcb/i.test(text)) return 'Techcombank';
  if (/mbbank|mb bank/i.test(text)) return 'MB Bank';
  if (/bidv/i.test(text)) return 'BIDV';
  if (/vietinbank/i.test(text)) return 'VietinBank';
  if (/tpbank/i.test(text)) return 'TPBank';
  if (/acb/i.test(text)) return 'ACB';
  return 'Unknown';
}

/**
 * Gọi webhook backend
 */
function callWebhook(payload, emailDate) {
  payload.transaction_time = emailDate ? emailDate.toISOString() : new Date().toISOString();

  var options = {
    method: 'POST',
    contentType: 'application/json',
    headers: {
      'x-webhook-secret': CONFIG.WEBHOOK_SECRET,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    var response = UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, options);
    var code = response.getResponseCode();
    var body = response.getContentText();

    Logger.log('Webhook response [' + code + ']: ' + body);

    if (code !== 200) {
      Logger.log('⚠️ Webhook lỗi — booking: ' + payload.booking_code);
    }
  } catch (e) {
    Logger.log('❌ Lỗi gọi webhook: ' + e.message);
  }
}

/**
 * Tạo Gmail label nếu chưa có
 */
function getOrCreateLabel(name) {
  var labels = GmailApp.getUserLabels();
  for (var i = 0; i < labels.length; i++) {
    if (labels[i].getName() === name) return labels[i];
  }
  return GmailApp.createLabel(name);
}

/**
 * Chạy hàm này MỘT LẦN để tạo trigger tự động mỗi phút
 * Vào Apps Script → Run → setupTrigger
 */
function setupTrigger() {
  // Xóa trigger cũ nếu có
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'checkBankEmails') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Tạo trigger mới chạy mỗi 1 phút
  ScriptApp.newTrigger('checkBankEmails')
    .timeBased()
    .everyMinutes(1)
    .create();

  Logger.log('✅ Trigger đã được tạo — checkBankEmails sẽ chạy mỗi 1 phút');
}

/**
 * Test thủ công — chạy hàm này để kiểm tra
 */
function testManual() {
  checkBankEmails();
}
