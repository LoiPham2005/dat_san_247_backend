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