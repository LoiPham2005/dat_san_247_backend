export interface FileValidationOptions {
  maxSize?: number; // bytes
  allowedImageTypes?: string[];
  allowedVideoTypes?: string[];
}

export class FileValidator {
  static readonly DEFAULT_OPTIONS: FileValidationOptions = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'],
    allowedVideoTypes: ['video/mp4', 'video/mpeg', 'video/quicktime']
  };

  static validate(
    file: Express.Multer.File, 
    options: FileValidationOptions = FileValidator.DEFAULT_OPTIONS
  ): { isValid: boolean; error?: string } {
    // Kiểm tra xem có file không
    if (!file) {
      return { isValid: false, error: 'Không có file nào được upload!' };
    }

    // Kiểm tra dung lượng file
    if (options.maxSize && file.size > options.maxSize) {
      return { 
        isValid: false, 
        error: `File không được vượt quá ${options.maxSize / (1024 * 1024)}MB!` 
      };
    }

    const isImage = options.allowedImageTypes?.includes(file.mimetype);
    const isVideo = options.allowedVideoTypes?.includes(file.mimetype);

    // Kiểm tra định dạng file
    if (!isImage && !isVideo) {
      return { 
        isValid: false, 
        error: 'Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif) hoặc video (mp4, mpeg, quicktime)!' 
      };
    }

    return { isValid: true };
  }
}