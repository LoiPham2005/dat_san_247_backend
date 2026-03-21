import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BannerService {
    constructor(private prisma: PrismaService) {}

    async getAllBanners() {
        const banners = await this.prisma.banners.findMany({
            include: {
                banner_pages: {
                    select: {
                        page: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return banners.map(b => ({
            ...b,
            pages: b.banner_pages.map(p => p.page)
        }));
    }

    async toggleActive(id: string, is_active: boolean) {
        const banner = await this.prisma.banners.findUnique({
            where: { id }
        });

        if (!banner) throw new NotFoundException('Không tìm thấy Banner');

        return this.prisma.banners.update({
            where: { id },
            data: { is_active }
        });
    }

    async createBanner(data: any) {
        const { pages, ...bannerData } = data;
        return this.prisma.banners.create({
            data: {
                ...bannerData,
                banner_pages: {
                    create: (pages || []).map((page: any) => ({ page }))
                }
            },
            include: {
                banner_pages: true
            }
        });
    }

    async updateBanner(id: string, data: any) {
        const { pages, ...bannerData } = data;
        
        // Update banner and handle pages (delete and recreate for simplicity)
        return this.prisma.$transaction(async (tx) => {
            if (pages) {
                await tx.banner_pages.deleteMany({
                    where: { banner_id: id }
                });
            }

            return tx.banners.update({
                where: { id },
                data: {
                    ...bannerData,
                    ...(pages ? {
                        banner_pages: {
                            create: pages.map((page: any) => ({ page }))
                        }
                    } : {})
                },
                include: {
                    banner_pages: true
                }
            });
        });
    }

    async deleteBanner(id: string) {
        const banner = await this.prisma.banners.findUnique({
            where: { id }
        });

        if (!banner) throw new NotFoundException('Không tìm thấy Banner');

        await this.prisma.banners.delete({
            where: { id }
        });

        return id;
    }
}
