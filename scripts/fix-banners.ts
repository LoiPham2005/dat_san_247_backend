import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function fix() {
    console.log('Update Banners...');
    await prisma.banners.updateMany({
        where: { position: 'HOME_TOP' },
        data: {
            is_active: true
        }
    });
    console.log('Update Success.');
    await prisma.$disconnect();
}
fix();
