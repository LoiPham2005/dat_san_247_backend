import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.permissions.findMany({
            orderBy: [
                { resource: 'asc' },
                { action: 'asc' }
            ],
        });
    }

    async findBySlug(slug: string) {
        const permission = await this.prisma.permissions.findUnique({
            where: { slug },
        });
        if (!permission) {
            throw new NotFoundException(`Permission with slug "${slug}" not found`);
        }
        return permission;
    }

    async findByIds(ids: string[]) {
        return this.prisma.permissions.findMany({
            where: {
                id: { in: ids },
            },
        });
    }

    async groupedByResource() {
        const permissions = await this.findAll();
        return permissions.reduce((acc, permission) => {
            if (!acc[permission.resource]) {
                acc[permission.resource] = [];
            }
            acc[permission.resource].push(permission);
            return acc;
        }, {} as Record<string, any[]>);
    }
}
