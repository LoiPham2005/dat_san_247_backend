import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ContentService {
    constructor(private prisma: PrismaService) {}

    // --- POLICIES ---

    async getAllPolicies() {
        return this.prisma.policies.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                author: {
                    select: { full_name: true }
                }
            }
        });
    }

    async upsertPolicy(data: any, userId?: string) {
        // If it's a new version of an existing type, we might want to mark others as not current
        if (data.is_current) {
            await this.prisma.policies.updateMany({
                where: { type: data.type },
                data: { is_current: false }
            });
        }

        return this.prisma.policies.create({
            data: {
                ...data,
                author_id: userId
            }
        });
    }

    // --- FAQS ---

    async getAllFaqs() {
        return this.prisma.faqs.findMany({
            orderBy: [
                { category: 'asc' },
                { display_order: 'asc' }
            ],
            include: {
                author: {
                    select: { full_name: true }
                }
            }
        });
    }

    async createFaq(data: any, userId?: string) {
        return this.prisma.faqs.create({
            data: {
                ...data,
                author_id: userId
            }
        });
    }

    async updateFaq(id: string, data: any) {
        const faq = await this.prisma.faqs.findUnique({ where: { id } });
        if (!faq) throw new NotFoundException('Không tìm thấy câu hỏi');

        return this.prisma.faqs.update({
            where: { id },
            data
        });
    }

    async deleteFaq(id: string) {
        const faq = await this.prisma.faqs.findUnique({ where: { id } });
        if (!faq) throw new NotFoundException('Không tìm thấy câu hỏi');

        await this.prisma.faqs.delete({ where: { id } });
        return id;
    }
}
