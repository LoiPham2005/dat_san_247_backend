import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { FileValidator } from '../helper/file-validator.helper';

@Injectable()
export class FileValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.file || (req.files && Array.isArray(req.files) && req.files.length > 0)) {
      const files = req.file ? [req.file] : (req.files as Express.Multer.File[]);
      
      for (const file of files) {
        const validation = FileValidator.validate(file);
        if (!validation.isValid) {
          throw new BadRequestException(validation.error);
        }
      }
    }
    next();
  }
}