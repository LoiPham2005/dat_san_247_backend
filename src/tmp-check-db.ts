
import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const lastFiles = await prisma.files.findMany({
            orderBy: { created_at: 'desc' },
            take: 10,
        });
        console.log('Last 10 files:');
        console.log(JSON.stringify(lastFiles, null, 2));

        const lastAttachments = await prisma.media_attachments.findMany({
            orderBy: { created_at: 'desc' },
            take: 10,
        });
        console.log('Last 10 attachments:');
        console.log(JSON.stringify(lastAttachments, null, 2));

        const lastReviews = await prisma.reviews.findMany({
            orderBy: { created_at: 'desc' },
            take: 5,
            include: { media_attachments: { include: { files: true } } }
        });
        console.log('Last 5 reviews:');
        console.log(JSON.stringify(lastReviews, null, 2));

    } finally {
        await prisma.$disconnect();
    }
}

main();
