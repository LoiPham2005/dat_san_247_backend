import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
    try {
        const venues = await prisma.venues.findMany({ select: { id: true, name: true, status: true, is_active: true, is_featured: true } });
        console.log('--- Venues ---');
        console.table(venues);

        const promotions = await prisma.promotions.findMany({ select: { id: true, name: true, status: true, is_public: true } });
        console.log('--- Promotions ---');
        console.table(promotions);

        const sportTypes = await prisma.sport_types.findMany();
        console.log('--- Sport Types ---');
        console.table(sportTypes);

        const banners = await prisma.banners.findMany();
        console.log('--- Banners ---');
        console.table(banners);

    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
