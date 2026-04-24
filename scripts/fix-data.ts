import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixData() {
    try {
        console.log('Fixing Venues...');
        const updatedVenue = await prisma.venues.update({
            where: { id: '1f0238f6-7dcf-4e6c-8ae1-18af4c8d8987' },
            data: { is_featured: true }
        });
        console.log('Updated Venue:', updatedVenue.name, 'is_featured:', updatedVenue.is_featured);

        console.log('Fixing Promotions...');
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);

        const updatedPromos = await prisma.promotions.updateMany({
            where: { is_public: true },
            data: {
                valid_from: yesterday,
                valid_to: nextMonth,
                status: 'ACTIVE'
            }
        });
        console.log('Updated Promotions count:', updatedPromos.count);

        console.log('Fixing Banners...');
        const updatedBanners = await prisma.banners.updateMany({
            where: { position: 'HOME_TOP' },
            data: {
                start_date: yesterday,
                end_date: nextMonth,
                is_active: true,
            }
        });
        console.log('Updated Banners count:', updatedBanners.count);

        console.log('Ensuring Banner Pages...');
        const bannersCheck = await prisma.banners.findMany();
        for (const banner of bannersCheck) {
            await prisma.banner_pages.upsert({
                where: { banner_id_page: { banner_id: banner.id, page: 'HOME' } },
                update: {},
                create: { banner_id: banner.id, page: 'HOME' }
            });
        }
        console.log('Banner pages checked.');

    } catch (error) {
        console.error('Error fixing data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixData();
