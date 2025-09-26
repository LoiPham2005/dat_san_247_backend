import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, FindOptionsWhere, ObjectLiteral } from 'typeorm';

@Injectable()
export class EntityHelper {
  /** Tìm entity theo ID, nếu không có thì báo lỗi */
  async findOrFail<T extends ObjectLiteral>(
    repo: Repository<T>,
    where: FindOptionsWhere<T>,   // đảm bảo đúng type
    errorMessage: string
  ): Promise<T> {
    const entity = await repo.findOne({ where });
    if (!entity) throw new NotFoundException(errorMessage ?? "Entity not found");
    return entity;
  }
}
