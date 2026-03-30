import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function fix() {
    console.log('Update Banners...');
    await prisma.banners.updateMany({
        where: { position: 'HOME_TOP' },
        data: {
            mobile_image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200',
            desktop_image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200',
            is_active: true
        }
    });
    console.log('Update Success.');
    await prisma.$disconnect();
}
fix();
