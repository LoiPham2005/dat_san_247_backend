// src/common/shared.module.ts
import { Module } from '@nestjs/common';
import { EntityHelper } from './helper/entity.helper';
import { FileUploadHelper } from './helper/file-upload.helper';
import { CloudinaryModule } from 'src/modules/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  providers: [FileUploadHelper, EntityHelper, CloudinaryModule], // 👈 phải có ở đây
  exports: [FileUploadHelper, EntityHelper, CloudinaryModule],   // 👈 sau đó mới export được
})
export class SharedModule {}
