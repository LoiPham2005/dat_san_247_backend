# 📖 Hướng dẫn sử dụng TypeORM Migrations

## 🎯 Migrations là gì?
Migrations là các file code để quản lý thay đổi database schema theo từng version, giống như Git cho database.

## ⚙️ Cấu hình cần thiết

### 1. Tắt `synchronize` trong production
Trong `src/config/database.config.ts`:
```typescript
synchronize: process.env.NODE_ENV === 'development', // Chỉ bật trong dev
dropSchema: false, // KHÔNG BAO GIỜ dùng true trong production
```

### 2. Cấu trúc thư mục
```
src/
├── database/
│   ├── migrations/        # Các file migration
│   │   ├── 1234567890123-CreateUsers.ts
│   │   ├── 1234567890124-CreateVenues.ts
│   │   └── ...
│   └── seeders/          # Dữ liệu mẫu
```

---

## 🚀 Các lệnh chính

### 1️⃣ **Tạo migration TỰ ĐỘNG** (Khuyên dùng)
TypeORM sẽ so sánh entities hiện tại với database và tự động tạo migration:

```bash
# Tạo migration với tên "InitialSchema"
npm run migration:gen --name=InitialSchema

# Tạo migration cho Content module
npm run migration:gen --name=AddContentTables

# Tạo migration thêm cột mới
npm run migration:gen --name=AddUserAvatar
```

**Khi nào dùng:**
- Khi bạn thêm/sửa entities
- TypeORM sẽ tự động tạo code SQL cho bạn
- Tiết kiệm thời gian, ít lỗi

### 2️⃣ **Tạo migration THỦ CÔNG**
Khi bạn muốn viết SQL phức tạp:

```bash
# Tạo file migration rỗng
npm run typeorm migration:create -- src/database/migrations/AddCustomIndexes
```

Sau đó tự viết SQL trong file migration.

### 3️⃣ **Chạy migrations**
Áp dụng các thay đổi vào database:

```bash
# Chạy tất cả migrations chưa chạy
npm run migration:run
```

### 4️⃣ **Hoàn tác migration**
Quay lại version trước:

```bash
# Hoàn tác migration gần nhất
npm run migration:revert

# Hoàn tác nhiều lần
npm run migration:revert
npm run migration:revert
```

### 5️⃣ **Reset database hoàn toàn**
```bash
# Xóa tất cả, chạy lại migrations, seed dữ liệu
npm run db:fresh
```

---

## 📝 Workflow thực tế

### **Scenario 1: Thêm entity mới**

1. **Tạo entity mới:**
```typescript
// src/modules/content/entities/banner.entity.ts
@Entity('banners')
export class Banner extends BaseEntity {
  @Column()
  title: string;
  // ...
}
```

2. **Đăng ký entity** trong module:
```typescript
TypeOrmModule.forFeature([Banner])
```

3. **Tạo migration:**
```bash
npm run migration:gen --name=CreateBannerTable
```

4. **Xem migration được tạo:**
File `src/database/migrations/1234567890123-CreateBannerTable.ts`:
```typescript
export class CreateBannerTable1234567890123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "banners" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_banners" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "banners"`);
    }
}
```

5. **Chạy migration:**
```bash
npm run migration:run
```

6. **Kiểm tra database:**
Bảng `banners` đã được tạo!

---

### **Scenario 2: Thêm cột vào bảng có sẵn**

1. **Sửa entity:**
```typescript
@Entity('users')
export class User {
  // Thêm cột mới
  @Column({ nullable: true })
  avatar_url: string;
}
```

2. **Tạo migration:**
```bash
npm run migration:gen --name=AddAvatarToUsers
```

3. **Migration tự động:**
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users" 
        ADD "avatar_url" character varying
    `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users" 
        DROP COLUMN "avatar_url"
    `);
}
```

4. **Chạy migration:**
```bash
npm run migration:run
```

---

### **Scenario 3: Migration phức tạp (thủ công)**

Khi bạn cần viết logic đặc biệt:

1. **Tạo migration rỗng:**
```bash
npm run typeorm migration:create -- src/database/migrations/MigrateOldUserData
```

2. **Viết code tùy chỉnh:**
```typescript
export class MigrateOldUserData1234567890123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thêm cột mới
        await queryRunner.query(`
            ALTER TABLE "users" ADD "full_name" VARCHAR
        `);

        // Migrate dữ liệu cũ
        await queryRunner.query(`
            UPDATE "users" 
            SET "full_name" = CONCAT("first_name", ' ', "last_name")
        `);

        // Xóa cột cũ
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "first_name",
            DROP COLUMN "last_name"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Hoàn tác
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD "first_name" VARCHAR,
            ADD "last_name" VARCHAR
        `);

        await queryRunner.query(`
            UPDATE "users" 
            SET "first_name" = split_part("full_name", ' ', 1),
                "last_name" = split_part("full_name", ' ', 2)
        `);

        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "full_name"
        `);
    }
}
```

---

## 🎓 Best Practices

### ✅ **Nên làm:**
1. **Tắt `synchronize`** trong production:
   ```typescript
   synchronize: process.env.NODE_ENV === 'development'
   ```

2. **Tạo migration sau mỗi thay đổi entity:**
   ```bash
   # Sau khi sửa entity
   npm run migration:gen --name=DescriptiveChangeName
   ```

3. **Review migration trước khi chạy:**
   - Đọc file migration được tạo
   - Đảm bảo SQL đúng

4. **Test migration trên dev trước:**
   ```bash
   npm run migration:run    # Test
   npm run migration:revert # Hoàn tác nếu lỗi
   ```

5. **Commit migration vào Git:**
   ```bash
   git add src/database/migrations/
   git commit -m "Add migration: CreateBannerTable"
   ```

6. **Chạy migration trên production:**
   ```bash
   # Trên server production
   npm run migration:run
   ```

### ❌ **Không nên:**
1. ❌ Dùng `synchronize: true` trong production
2. ❌ Sửa migration đã chạy (tạo migration mới để fix)
3. ❌ Xóa migration đã được commit
4. ❌ Dùng `dropSchema: true` (mất dữ liệu!)

---

## 🆘 Troubleshooting

### Lỗi: "No changes in database schema were found"
**Nguyên nhân:** Database schema đã sync với entities

**Giải pháp:**
1. Bạn đã thay đổi entity chưa?
2. Entity có được import trong module không?
3. Thử tạo migration thủ công

### Lỗi: "QueryFailedError: relation already exists"
**Nguyên nhân:** Migration đã chạy rồi

**Giải pháp:**
```bash
# Kiểm tra migrations đã chạy
npm run typeorm migration:show

# Hoàn tác nếu cần
npm run migration:revert
```

### Reset hoàn toàn database
```bash
# Cẩn thận: XÓA TẤT CẢ DỮ LIỆU!
npm run db:fresh
```

---

## 📊 Migration trong CI/CD

### Production deployment:
```bash
# 1. Build code
npm run build

# 2. Chạy migrations
npm run migration:run

# 3. Start server
npm run start
```

### Docker:
```dockerfile
# Dockerfile
RUN npm run build
CMD ["sh", "-c", "npm run migration:run && npm run start"]
```

---

## 🔍 Kiểm tra migrations

### Xem tất cả migrations:
```bash
npm run typeorm migration:show
```

Output:
```
[X] CreateUsers1234567890123
[X] CreateVenues1234567890124
[ ] AddContentTables1234567890125
```
- `[X]` = Đã chạy
- `[ ]` = Chưa chạy

---

## 📚 Tài liệu thêm

- [TypeORM Migrations Docs](https://typeorm.io/migrations)
- [NestJS Database Guide](https://docs.nestjs.com/techniques/database#migrations)

---

## 💡 Tóm tắt nhanh

```bash
# Workflow cơ bản
1. Sửa entity           → src/modules/*/entities/*.entity.ts
2. Tạo migration        → npm run migration:gen --name=YourChangeName
3. Review migration     → src/database/migrations/*-YourChangeName.ts
4. Chạy migration       → npm run migration:run
5. Test ứng dụng        → npm run dev
6. Commit migration     → git add + git commit

# Nếu sai
npm run migration:revert  # Hoàn tác
```

**Ghi nhớ:** Migrations = Git cho database. Mỗi thay đổi schema = 1 migration file!
