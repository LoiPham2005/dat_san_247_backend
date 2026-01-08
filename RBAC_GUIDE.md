# Dynamic RBAC System - Hướng Dẫn Sử Dụng

## 📋 Tổng Quan

Hệ thống Dynamic RBAC (Role-Based Access Control) cho phép Admin tự tạo và quản lý vai trò (roles) cùng quyền hạn (permissions) mà **không cần sửa code**.

## 🗄️ Cấu Trúc Database

### 1. Bảng `permissions`
Lưu trữ tất cả quyền hạn trong hệ thống.

```sql
- id: UUID
- slug: string (unique) - Ví dụ: 'users:create', 'bookings:read'
- resource: string - Ví dụ: 'users', 'bookings'
- action: string - Ví dụ: 'create', 'read', 'update', 'delete'
- description: string
```

### 2. Bảng `roles`
Lưu trữ các vai trò.

```sql
- id: UUID
- name: string (unique) - Ví dụ: 'Venue Manager'
- slug: string (unique) - Ví dụ: 'venue_manager'
- description: string
- is_system: boolean - Role hệ thống không thể xóa
- is_active: boolean
```

### 3. Bảng `role_permissions` (Join Table)
Liên kết Role với Permission (Many-to-Many).

### 4. Bảng `users`
Cột `role_id` (Foreign Key) thay vì `role` enum.

## 🚀 API Endpoints

### Permissions

#### 1. Lấy tất cả permissions
```http
GET /api/v1/permissions
```

**Response:**
```json
[
  {
    "id": "uuid",
    "slug": "users:create",
    "resource": "users",
    "action": "create",
    "description": "Create new users"
  }
]
```

#### 2. Lấy permissions nhóm theo resource
```http
GET /api/v1/permissions/grouped
```

**Response:**
```json
{
  "users": [
    { "slug": "users:create", "description": "..." },
    { "slug": "users:read", "description": "..." }
  ],
  "bookings": [...]
}
```

### Roles

#### 1. Lấy tất cả roles
```http
GET /api/v1/roles
```

#### 2. Lấy role theo ID
```http
GET /api/v1/roles/:id
```

#### 3. Tạo role mới
```http
POST /api/v1/roles
Content-Type: application/json

{
  "name": "Kế Toán",
  "slug": "ke_toan",
  "description": "Quản lý doanh thu và báo cáo",
  "permissionIds": [
    "uuid-of-payments:read",
    "uuid-of-analytics:view"
  ]
}
```

#### 4. Cập nhật role
```http
PUT /api/v1/roles/:id
Content-Type: application/json

{
  "name": "Kế Toán Trưởng",
  "description": "Quản lý toàn bộ tài chính",
  "permissionIds": [
    "uuid-of-payments:read",
    "uuid-of-payments:process",
    "uuid-of-analytics:view"
  ],
  "isActive": true
}
```

**Lưu ý:** Không thể sửa `slug` sau khi tạo.

#### 5. Xóa role
```http
DELETE /api/v1/roles/:id
```

**Điều kiện:**
- Không thể xóa role hệ thống (`is_system = true`)
- Không thể xóa role đang được gán cho user

## 🔐 Sử Dụng Permission Guard

### Trong Controller

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';

@Controller('venues')
@UseGuards(PermissionsGuard)
export class VenuesController {
  
  @Get()
  @RequirePermissions('venues:read')
  findAll() {
    // Chỉ user có permission 'venues:read' mới truy cập được
  }

  @Post()
  @RequirePermissions('venues:create')
  create() {
    // Chỉ user có permission 'venues:create' mới truy cập được
  }

  @Delete(':id')
  @RequirePermissions('venues:delete', 'venues:manage')
  delete() {
    // User phải có CẢ HAI permission mới được xóa
  }
}
```

### Wildcard Permission (Super Admin)

User có permission `*` sẽ bypass tất cả các check.

## 📊 Quy Trình Làm Việc

### 1. Developer (Lần đầu setup)
- Định nghĩa tất cả permissions trong `database.seeder.ts`
- Chạy app → Permissions tự động được seed vào DB
- Tạo các role mặc định (Admin, Owner, Customer...)

### 2. Admin (Trên UI)
1. Vào trang "Quản lý vai trò"
2. Bấm "Tạo vai trò mới"
3. Nhập tên: "Nhân viên kho"
4. Chọn permissions:
   - ✅ `venues:read`
   - ✅ `courts:read`
   - ✅ `bookings:read`
5. Lưu → Role được tạo ngay lập tức

### 3. Gán Role cho User
```http
PUT /api/v1/users/:userId
Content-Type: application/json

{
  "roleId": "uuid-of-nhan-vien-kho"
}
```

## 🎯 Permissions Mặc Định

### Users
- `users:create` - Tạo user mới
- `users:read` - Xem danh sách user
- `users:update` - Cập nhật user
- `users:delete` - Xóa user

### Venues
- `venues:create` - Tạo sân
- `venues:read` - Xem sân
- `venues:update` - Cập nhật sân
- `venues:delete` - Xóa sân
- `venues:manage` - Quản lý toàn bộ sân

### Bookings
- `bookings:create` - Đặt sân
- `bookings:read` - Xem tất cả booking
- `bookings:read-own` - Chỉ xem booking của mình
- `bookings:update` - Cập nhật booking
- `bookings:delete` - Xóa booking
- `bookings:check-in` - Check-in khách

### Roles & Permissions
- `roles:create` - Tạo role
- `roles:read` - Xem role
- `roles:update` - Cập nhật role
- `roles:delete` - Xóa role

### Wildcard
- `*` - Tất cả quyền (Super Admin)

## 🔧 Thêm Permission Mới

### Bước 1: Thêm vào Seeder
```typescript
// src/database/database.seeder.ts
const permissions = [
  // ... existing permissions
  { 
    resource: 'reports', 
    action: 'export', 
    slug: 'reports:export', 
    description: 'Export reports to Excel' 
  },
];
```

### Bước 2: Xóa DB và chạy lại
```bash
# Xóa tất cả permissions và roles cũ
# Hoặc tạo migration để insert permission mới
```

### Bước 3: Sử dụng trong Code
```typescript
@Get('export')
@RequirePermissions('reports:export')
exportReport() {
  // ...
}
```

## ⚠️ Lưu Ý Quan Trọng

1. **System Roles**: Không được xóa hoặc sửa slug
2. **Permission Naming**: Luôn theo format `resource:action`
3. **Eager Loading**: Role tự động load permissions khi query User
4. **Cascade**: Khi xóa Role, các liên kết trong `role_permissions` tự động xóa
5. **Validation**: Không thể xóa role đang được gán cho user

## 🎨 Ví Dụ Use Case

### Use Case 1: Tạo role "Quản lý ca sáng"
```json
POST /api/v1/roles
{
  "name": "Quản lý ca sáng",
  "slug": "morning_shift_manager",
  "description": "Quản lý sân từ 6h-12h",
  "permissionIds": [
    "bookings:read",
    "bookings:check-in",
    "courts:read"
  ]
}
```

### Use Case 2: Nâng cấp quyền cho role
```json
PUT /api/v1/roles/uuid-morning-shift-manager
{
  "permissionIds": [
    "bookings:read",
    "bookings:check-in",
    "bookings:update",  // Thêm quyền update
    "courts:read"
  ]
}
```

## 📈 Performance Tips

1. **Eager Loading**: Role đã được config `eager: true` → Không cần join thủ công
2. **Cache**: Nên cache danh sách permissions trong Redis
3. **Index**: Đảm bảo index trên `slug` của Role và Permission

## 🔄 Migration từ Enum sang Dynamic RBAC

Dự án đã được migrate:
- ✅ Xóa enum `UserRole` trong User entity
- ✅ Thêm relation `role_id` → `roles` table
- ✅ Update RolesGuard → PermissionsGuard
- ✅ Seed dữ liệu mặc định

## 📞 Support

Nếu cần thêm permission mới hoặc role mới, liên hệ team Backend để cập nhật seeder.
