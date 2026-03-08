import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any) {
        // Nếu auth lỗi hoặc không có user → trả về null chứ không throw Unauthorized (JWT strategy sẽ được skip)
        return user || null;
    }
}
