import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
    constructor(
        @InjectRepository(Permission)
        private permissionsRepository: Repository<Permission>,
    ) { }

    async findAll(): Promise<Permission[]> {
        return this.permissionsRepository.find({
            order: { resource: 'ASC', action: 'ASC' },
        });
    }

    async findBySlug(slug: string): Promise<Permission> {
        const permission = await this.permissionsRepository.findOne({
            where: { slug },
        });
        if (!permission) {
            throw new NotFoundException(`Permission with slug "${slug}" not found`);
        }
        return permission;
    }

    async findByIds(ids: string[]): Promise<Permission[]> {
        return this.permissionsRepository.findByIds(ids);
    }

    async groupedByResource(): Promise<Record<string, Permission[]>> {
        const permissions = await this.findAll();
        return permissions.reduce((acc, permission) => {
            if (!acc[permission.resource]) {
                acc[permission.resource] = [];
            }
            acc[permission.resource].push(permission);
            return acc;
        }, {} as Record<string, Permission[]>);
    }
}
