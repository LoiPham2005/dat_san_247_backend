# 🎯 Dynamic RBAC System - Tóm Tắt

## ✅ Đã Hoàn Thành

Hệ thống **Dynamic Role-Based Access Control (RBAC)** đã được triển khai hoàn chỉnh cho phép:

### 🔑 Tính Năng Chính

1. **Admin tự tạo Role mới** qua API mà không cần sửa code
2. **Gán Permissions linh hoạt** cho từng Role
3. **Bảo vệ System Roles** (không thể xóa/sửa Admin, Customer...)
4. **Permission-based Guard** thay vì Role-based (chi tiết hơn)
5. **Auto-seed** dữ liệu mặc định khi khởi động app

---

## 📁 Cấu Trúc Files Đã Tạo

```
src/
├── modules/
│   ├── permissions/
│   │   ├── entities/
│   │   │   └── permission.entity.ts      # Entity Permission
│   │   ├── permissions.controller.ts     # API endpoints
│   │   ├── permissions.service.ts        # Business logic
│   │   └── permissions.module.ts
│   │
│   ├── roles/
│   │   ├── entities/
│   │   │   └── role.entity.ts            # Entity Role
│   │   ├── dto/
│   │   │   └── role.dto.ts               # DTOs
│   │   ├── roles.controller.ts           # CRUD API
│   │   ├── roles.service.ts              # Business logic
│   │   └── roles.module.ts
│   │
│   └── users/
│       └── entities/
│           └── user.entity.ts            # Đã update: role_id thay vì enum
│
├── common/
│   ├── guards/
│   │   └── permissions.guard.ts          # Guard kiểm tra permission
│   └── decorators/
│       └── permissions.decorator.ts      # @RequirePermissions()
│
├── database/
│   └── database.seeder.ts                # Seed 30 permissions + 4 roles
│
└── examples/
    └── permission-guard-examples.controller.ts  # Ví dụ sử dụng

RBAC_GUIDE.md                             # Hướng dẫn chi tiết
```

---

## 🗄️ Database Schema

### Bảng `permissions`
| Column      | Type   | Description                  |
|-------------|--------|------------------------------|
| id          | UUID   | Primary key                  |
| slug        | String | Unique (e.g., 'users:create')|
| resource    | String | e.g., 'users', 'bookings'    |
| action      | String | e.g., 'create', 'read'       |
| description | Text   | Mô tả quyền                  |

### Bảng `roles`
| Column      | Type    | Description                     |
|-------------|---------|---------------------------------|
| id          | UUID    | Primary key                     |
| name        | String  | Tên role (e.g., 'Venue Manager')|
| slug        | String  | Unique (e.g., 'venue_manager')  |
| description | Text    | Mô tả                           |
| is_system   | Boolean | System role (không xóa được)    |
| is_active   | Boolean | Trạng thái                      |

### Bảng `role_permissions` (Join Table)
| Column        | Type | Description          |
|---------------|------|----------------------|
| role_id       | UUID | FK → roles.id        |
| permission_id | UUID | FK → permissions.id  |

### Bảng `users` (Updated)
- **Trước:** `role` (enum)
- **Sau:** `role_id` (UUID, FK → roles.id)

---

## 🚀 API Endpoints

### Permissions
```http
GET    /api/v1/permissions          # Lấy tất cả permissions
GET    /api/v1/permissions/grouped  # Nhóm theo resource
```

### Roles
```http
GET    /api/v1/roles                # Lấy tất cả roles
GET    /api/v1/roles/:id            # Lấy role theo ID
POST   /api/v1/roles                # Tạo role mới
PUT    /api/v1/roles/:id            # Cập nhật role
DELETE /api/v1/roles/:id            # Xóa role
```

---

## 💡 Cách Sử Dụng

### 1. Trong Controller (Bảo vệ endpoint)

```typescript
import { UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';

@Controller('venues')
@UseGuards(PermissionsGuard)
export class VenuesController {
  
  @Get()
  @RequirePermissions('venues:read')
  findAll() {
    // Chỉ user có permission 'venues:read' mới truy cập
  }

  @Post()
  @RequirePermissions('venues:create')
  create() {
    // Chỉ user có permission 'venues:create'
  }

  @Delete(':id')
  @RequirePermissions('venues:delete', 'venues:manage')
  delete() {
    // Phải có CẢ HAI permission
  }
}
```

### 2. Tạo Role Mới (Qua API)

```bash
POST /api/v1/roles
Content-Type: application/json

{
  "name": "Kế Toán",
  "slug": "ke_toan",
  "description": "Quản lý doanh thu",
  "permissionIds": [
    "uuid-of-payments:read",
    "uuid-of-analytics:view"
  ]
}
```

### 3. Gán Role cho User

```typescript
// Trong UsersService
async updateUserRole(userId: string, roleId: string) {
  const role = await this.rolesService.findOne(roleId);
  const user = await this.usersRepository.findOne({ where: { id: userId } });
  user.role = role;
  return this.usersRepository.save(user);
}
```

---

## 📊 Dữ Liệu Mặc Định (Seeded)

### 30 Permissions
- **Users:** create, read, update, delete
- **Venues:** create, read, update, delete, manage
- **Courts:** create, read, update, delete
- **Bookings:** create, read, read-own, update, delete, check-in
- **Payments:** read, process
- **Reviews:** create, read, delete
- **Analytics:** view
- **Roles:** create, read, update, delete
- **Wildcard:** `*` (Super Admin)

### 4 Roles Mặc Định

#### 1. Super Admin (`admin`)
- Permission: `*` (tất cả)
- `is_system: true`

#### 2. Venue Owner (`owner`)
- Permissions:
  - `venues:manage`
  - `courts:*` (tất cả quyền courts)
  - `bookings:read`, `bookings:update`
  - `analytics:view`
  - `users:read`

#### 3. Venue Staff (`venue_staff`)
- Permissions:
  - `bookings:read`
  - `bookings:check-in`
  - `courts:read`

#### 4. Customer (`customer`)
- Permissions:
  - `bookings:create`
  - `bookings:read-own`
  - `reviews:create`
  - `venues:read`

---

## ⚙️ Quy Trình Làm Việc

### Developer (Một lần duy nhất)
1. Định nghĩa permissions trong `database.seeder.ts`
2. Chạy app → Auto-seed vào DB
3. Sử dụng `@RequirePermissions()` trong controllers

### Admin (Trên UI)
1. Vào trang "Quản lý vai trò"
2. Bấm "Tạo vai trò mới"
3. Nhập tên: "Nhân viên kho"
4. Tick chọn permissions:
   - ✅ `venues:read`
   - ✅ `courts:read`
   - ✅ `bookings:read`
5. Lưu → Role được tạo ngay lập tức
6. Gán role này cho user

---

## 🔐 Bảo Mật

### System Roles
- Có `is_system = true`
- **Không thể xóa**
- **Không thể sửa slug**
- Ví dụ: Admin, Customer

### Validation
- Không thể xóa role đang được gán cho user
- Permission IDs phải hợp lệ khi tạo/update role
- Slug phải unique

### Wildcard Permission
- Permission `*` = Super Admin
- Bypass tất cả permission checks

---

## 📈 Performance

- **Eager Loading:** Role tự động load permissions khi query User
- **Caching:** Nên cache danh sách permissions trong Redis (TODO)
- **Index:** Đã có index trên `slug` của Role và Permission

---

## 🎯 So Sánh: Trước vs Sau

### ❌ Trước (Static RBAC)
```typescript
// Trong user.entity.ts
@Column({ type: 'enum', enum: UserRole })
role: UserRole; // ADMIN, OWNER, CUSTOMER...

// Trong controller
@Roles(UserRole.ADMIN, UserRole.OWNER)
getVenues() { }

// Muốn thêm role mới → Phải sửa code, migration, deploy
```

### ✅ Sau (Dynamic RBAC)
```typescript
// Trong user.entity.ts
@ManyToOne(() => Role)
role: Role; // Relation đến bảng roles

// Trong controller
@RequirePermissions('venues:read', 'venues:manage')
getVenues() { }

// Thêm role mới → Gọi API, không cần sửa code!
```

---

## 📚 Tài Liệu Tham Khảo

- **Chi tiết:** Xem file `RBAC_GUIDE.md`
- **Ví dụ code:** Xem file `src/examples/permission-guard-examples.controller.ts`

---

## ✨ Tính Năng Nổi Bật

1. ✅ **Không cần sửa code** khi thêm role mới
2. ✅ **Phân quyền chi tiết** (permission-level thay vì role-level)
3. ✅ **Bảo vệ system roles** khỏi bị xóa nhầm
4. ✅ **Auto-seed** dữ liệu mặc định
5. ✅ **Type-safe** với TypeScript
6. ✅ **Eager loading** để tối ưu query
7. ✅ **Wildcard support** cho Super Admin

---

## 🚦 Trạng Thái

- ✅ **Backend:** Hoàn thành 100%
- ⏳ **Frontend UI:** Chưa làm (cần tạo trang quản lý roles)
- ⏳ **Cache Redis:** Chưa implement (optional)

---

## 🎉 Kết Luận

Hệ thống Dynamic RBAC đã sẵn sàng sử dụng! Admin giờ có thể:
- Tự tạo role mới qua API
- Gán permissions linh hoạt
- Quản lý phân quyền mà không cần developer can thiệp

**Chúc bạn code vui vẻ! 🚀**
