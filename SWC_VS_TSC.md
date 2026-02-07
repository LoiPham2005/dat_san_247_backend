# SWC vs TypeScript Compiler - So sánh và Hướng dẫn

## ⚡ SWC là gì?

**SWC** (Speedy Web Compiler) là compiler được viết bằng Rust, nhanh hơn 20x so với TypeScript compiler (tsc).

## 📊 So sánh

| Tiêu chí | TypeScript (tsc) | SWC |
|----------|-----------------|-----|
| **Tốc độ build** | Chậm (~10s) | Rất nhanh (~0.5s) |
| **Hot reload** | Chậm (2-3s) | Nhanh (<1s) |
| **Type checking** | Có sẵn | Không có (cần thêm) |
| **Decorators metadata** | Tốt (100%) | Không hoàn hảo (~95%) |
| **Swagger compatibility** | ✅ Hoàn hảo | ⚠️ Có thể lỗi |
| **Production build** | ✅ An toàn | ✅ An toàn |
| **Development** | ✅ Ổn định | ⚠️ Có thể lỗi với decorators phức tạp |

## 🎯 Khi nào nên dùng SWC?

### ✅ **NÊN dùng SWC khi:**
1. Dự án lớn, build chậm (>10s)
2. Cần hot reload nhanh trong development
3. Không dùng nhiều decorators phức tạp
4. Không dùng Swagger hoặc dùng Swagger đơn giản
5. Team đã test kỹ và không gặp vấn đề

### ❌ **KHÔNG NÊN dùng SWC khi:**
1. Dự án mới, nhỏ (<100 files)
2. Dùng nhiều decorators phức tạp (Swagger, TypeORM relations)
3. Có circular dependencies trong entities
4. Cần type checking chặt chẽ trong development
5. Team chưa quen với troubleshooting SWC

## 🔧 Cấu hình

### Option 1: TypeScript Compiler (Mặc định - Khuyên dùng)

```json
// nest-cli.json
{
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

**Lợi ích:**
- ✅ Ổn định 100%
- ✅ Hỗ trợ đầy đủ decorators
- ✅ Type checking built-in
- ✅ Swagger hoạt động hoàn hảo

**Nhược điểm:**
- ❌ Build chậm hơn
- ❌ Hot reload chậm hơn

### Option 2: SWC (Nhanh nhưng có rủi ro)

```json
// nest-cli.json
{
  "compilerOptions": {
    "deleteOutDir": true,
    "builder": "swc",
    "typeCheck": true  // Bật type checking
  }
}
```

**Lợi ích:**
- ✅ Build cực nhanh
- ✅ Hot reload tức thì

**Nhược điểm:**
- ❌ Có thể lỗi với Swagger
- ❌ Metadata không chính xác 100%
- ❌ Khó debug hơn

## 🐛 Lỗi thường gặp với SWC

### 1. Circular dependency với Swagger
```
Error: A circular dependency has been detected (property key: "BANNER")
```

**Nguyên nhân:** SWC emit metadata khác với tsc, khiến Swagger nhầm lẫn enum value với entity name.

**Giải pháp:**
- Bỏ SWC, dùng tsc
- Hoặc ẩn property khỏi Swagger: `@ApiHideProperty()`

### 2. Decorators không hoạt động
```
Error: Cannot read property 'metadata' of undefined
```

**Nguyên nhân:** SWC không emit metadata đầy đủ cho decorators.

**Giải pháp:**
```json
// .swcrc
{
  "jsc": {
    "transform": {
      "legacyDecorator": true,
      "decoratorMetadata": true
    }
  }
}
```

## 💡 Khuyến nghị cho dự án của bạn

### Hiện tại: KHÔNG dùng SWC

**Lý do:**
1. ❌ Gặp lỗi circular dependency với Swagger
2. ❌ Có nhiều decorators phức tạp (TypeORM, Swagger)
3. ❌ Circular relationships trong entities (Content ↔ Banner)
4. ⏱️ Thời gian build hiện tại chấp nhận được

### Tương lai: Có thể dùng SWC khi:

1. ✅ Dự án lớn hơn, build >30s
2. ✅ Đã remove Swagger hoặc đơn giản hóa entities
3. ✅ Production build (không cần type checking)

## 🚀 Cấu hình tối ưu

### Development (Ổn định)
```json
// nest-cli.json
{
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": false  // Tắt webpack để nhanh hơn
  }
}
```

### Production (Nhanh)
```json
// package.json
{
  "scripts": {
    "build": "nest build",  // Dùng tsc cho safety
    "build:fast": "nest build --builder swc"  // Chỉ dùng khi cần
  }
}
```

## 📚 Tài liệu

- [NestJS SWC Guide](https://docs.nestjs.com/recipes/swc)
- [SWC Documentation](https://swc.rs/)
- [TypeScript vs SWC Benchmark](https://github.com/swc-project/swc#benchmark)

## 🎓 Kết luận

**Cho dự án hiện tại:**
```
👉 DÙNG TypeScript Compiler (tsc)
👉 KHÔNG dùng SWC (vì Swagger + TypeORM phức tạp)
```

**Công thức:**
- Dự án nhỏ/vừa + Swagger + TypeORM = **Dùng tsc**
- Dự án lớn + API đơn giản + Không Swagger = **Có thể dùng SWC**
