# 🔍 PHÂN TÍCH TRÙNG LẶP ENTITIES - Đặt Sân 24/7

**Ngày phân tích:** 01/02/2026 23:34  
**Mục tiêu:** Tìm và loại bỏ các thuộc tính trùng lặp trong entities

---

## ⚠️ CÁC VẤN ĐỀ TRÙNG LẶP PHÁT HIỆN

### 1. 🔴 CRITICAL: Payment vs Transaction (Trùng lặp nghiêm trọng)

**Vấn đề:**
- `Payment` entity: Quản lý thanh toán cho booking
- `Transaction` entity: Quản lý giao dịch ví (wallet transactions)

**Thuộc tính trùng lặp:**
- Cả 2 đều có: `amount`, `status`, `refundAmount`, `metadata`
- Cả 2 đều liên kết với `Booking`
- `Payment.transactionId` vs `Transaction.id` gây nhầm lẫn

**Phân tích:**
- `Payment`: Nên dùng cho **thanh toán booking** (liên kết trực tiếp với Booking)
- `Transaction`: Nên dùng cho **giao dịch ví** (nạp tiền, rút tiền, chuyển khoản)

**Giải pháp:**
```
Payment (Thanh toán Booking)
├── bookingId ✅
├── amount ✅
├── paymentMethod ✅
├── status ✅
└── gatewayResponse ✅

Transaction (Giao dịch Ví)
├── userId ✅
├── walletId (THÊM MỚI)
├── type (RECHARGE/PAYOUT/TRANSFER) ✅
├── amount ✅
├── balanceAfter ✅
└── referenceId (có thể link tới Payment) ✅
```

---

### 2. 🟡 MEDIUM: Content Entity - Quá nhiều thuộc tính media

**Vấn đề:**
```typescript
// Content.entity.ts
thumbnailUrl: string;        // ❌ Trùng
imageUrls: string[];         // ❌ Trùng
videoUrl: string;            // ❌ Trùng
ogImage: string;             // ❌ Trùng (Open Graph)
```

**Giải pháp:**
Nên dùng **polymorphic relation** với `File` entity:
```typescript
// Content.entity.ts
@OneToMany(() => File, file => file.targetId, {
    where: { targetType: 'CONTENT' }
})
files: File[];

// Hoặc giữ thumbnailUrl cho performance, bỏ các field khác
thumbnailUrl: string;  // ✅ Keep for quick access
// Remove: imageUrls, videoUrl, ogImage
```

---

### 3. 🟡 MEDIUM: Booking Entity - Thông tin khách hàng trùng lặp

**Vấn đề:**
```typescript
// Booking.entity.ts
customerId: string;          // ✅ FK to User
customerName: string;        // ❌ Trùng với User.fullName
customerPhone: string;       // ❌ Trùng với User.phone
customerEmail: string;       // ❌ Trùng với User.email
```

**Lý do tồn tại:**
- Snapshot data tại thời điểm đặt (nếu user đổi info sau)
- Guest booking (không cần tài khoản)

**Giải pháp:**
```typescript
// Nếu KHÔNG hỗ trợ guest booking:
// ❌ XÓA: customerName, customerPhone, customerEmail
// ✅ GIỮ: customerId + relation

// Nếu CÓ hỗ trợ guest booking:
// ✅ GIỮ TẤT CẢ nhưng đổi tên:
customerId: string | null;   // Nullable for guest
guestName: string | null;
guestPhone: string | null;
guestEmail: string | null;
```

---

### 4. 🟢 LOW: Venue/Court/Review - Image handling

**Hiện tại:**
- `VenueImage` entity (riêng)
- `CourtImage` entity (riêng)
- `ReviewImage` entity (riêng)

**Đã được tối ưu:** User đã revert về cách dùng entities riêng (đúng quyết định cho business logic phức tạp)

**Trạng thái:** ✅ OK - Không cần thay đổi

---

### 5. 🟡 MEDIUM: AI Module - Conversation vs Message

**Vấn đề:**
- `AIConversation` + `AIMessage` (AI module)
- `Conversation` + `Message` (Chat module)

**Phân tích:**
- AI: Chatbot conversations (user ↔ AI)
- Chat: Human-to-human messaging

**Giải pháp:** ✅ Giữ riêng biệt (khác use case)

---

### 6. 🔴 CRITICAL: Loyalty - File trùng lặp 100%

**Vấn đề:**
```
loyalty/entities/
├── loyalty.entity.ts        ❌ TRÙNG 100%
├── user-point.entity.ts     ✅ KEEP
└── point-transaction.entity.ts ✅ KEEP
```

**Giải pháp:** ✅ ĐÃ XÓA `loyalty.entity.ts` ở bước trước

---

### 7. 🟡 MEDIUM: Notification - Announcement overlap

**Vấn đề:**
```typescript
// Notification.entity.ts
type: NotificationType;      // BOOKING, PAYMENT, PROMOTION...

// SystemAnnouncement.entity.ts
title: string;
content: string;
targetAudience: string;
```

**Phân tích:**
- `Notification`: Cá nhân hóa (user-specific)
- `SystemAnnouncement`: Broadcast (toàn hệ thống)

**Giải pháp:** ✅ Giữ riêng biệt (khác use case)

---

### 8. 🟢 LOW: Wallet - Simple-array vs JSONB

**Vấn đề:**
Nhiều entities dùng `simple-array` thay vì `jsonb`:
```typescript
// Content.entity.ts
@Column({ type: 'simple-array' })  // ❌ Không tối ưu
tags: string[];

// Nên dùng:
@Column({ type: 'jsonb' })         // ✅ Tối ưu cho Postgres
tags: string[];
```

**Giải pháp:** Chuyển tất cả `simple-array` → `jsonb`

---

## 📋 KẾ HOẠCH TỐI ƯU HÓA

### Phase 1: Critical Fixes (Ưu tiên cao)

1. **Làm rõ Payment vs Transaction**
   - Tách biệt rõ ràng: Payment = Booking payment, Transaction = Wallet
   - Thêm `walletId` vào Transaction
   - Xóa `refundAmount` khỏi Payment (dùng Transaction.REFUND)

2. **Xóa duplicate loyalty.entity.ts** ✅ DONE

3. **Tối ưu Content media fields**
   - Giữ `thumbnailUrl` cho performance
   - Xóa `imageUrls`, `videoUrl`, `ogImage`
   - Dùng `File` entity với polymorphic relation

### Phase 2: Medium Fixes

4. **Chuẩn hóa Booking customer info**
   - Quyết định: Có hỗ trợ guest booking không?
   - Nếu không: Xóa customer* fields
   - Nếu có: Đổi tên thành guest* fields

5. **Chuyển simple-array → jsonb**
   - Content: tags, categories, seoKeywords
   - Venue: searchKeywords
   - Court: sportTypes (đã làm)

### Phase 3: Low Priority

6. **Thêm indexes thiếu**
7. **Chuẩn hóa naming conventions**

---

## 🎯 QUYẾT ĐỊNH CẦN USER XÁC NHẬN

### ❓ Câu hỏi 1: Guest Booking
**Hệ thống có cho phép đặt sân KHÔNG CẦN đăng ký không?**
- ✅ CÓ → Giữ `customerName/Phone/Email` (đổi tên `guest*`)
- ❌ KHÔNG → Xóa các field này, chỉ dùng `customerId`

### ❓ Câu hỏi 2: Content Media
**Content (blog, banner) có cần nhiều ảnh/video không?**
- ✅ CÓ → Dùng `File` entity relation
- ❌ KHÔNG → Chỉ giữ `thumbnailUrl`

### ❓ Câu hỏi 3: Payment Flow
**Thanh toán có dùng Wallet không?**
- ✅ CÓ → Cần tách rõ Payment vs Transaction
- ❌ KHÔNG → Có thể merge 2 entities

---

## 📊 TỔNG KẾT

| Vấn đề | Mức độ | Trạng thái | Hành động |
|:-------|:------:|:----------:|:----------|
| Payment vs Transaction | 🔴 Critical | Pending | Cần tách biệt rõ |
| Loyalty duplicate | 🔴 Critical | ✅ Fixed | Đã xóa |
| Content media fields | 🟡 Medium | Pending | Tối ưu về File entity |
| Booking customer info | 🟡 Medium | Pending | Cần quyết định guest booking |
| simple-array → jsonb | 🟡 Medium | Pending | Migrate data type |
| Image entities | 🟢 Low | ✅ OK | Giữ nguyên |

**Tổng số vấn đề:** 6  
**Đã fix:** 1  
**Cần fix:** 5  
**Cần quyết định:** 3

---

**Next Steps:**
1. User xác nhận 3 câu hỏi trên
2. Thực hiện Phase 1 fixes
3. Migrate database nếu cần
4. Test thoroughly

