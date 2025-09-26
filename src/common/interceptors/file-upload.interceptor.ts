import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileValidator } from '../helper/file-validator.helper';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const files = request.files || (request.file ? [request.file] : []);

    if (files.length > 0) {
      for (const file of files) {
        const validation = FileValidator.validate(file);
        if (!validation.isValid) {
          throw new BadRequestException(validation.error);
        }
      }
    }

    return next.handle();
  }
}