import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    const venueId = '1f0238f6-7dcf-4e6c-8ae1-18af4c8d8987';
    const venue = await prisma.venues.findUnique({
        where: { id: venueId },
        select: { id: true, name: true, owner_id: true }
    });
    console.log('Venue Info:', venue);

    const reviews = await prisma.reviews.findMany({
        include: {
            users: { select: { full_name: true } },
            venues: { select: { id: true, name: true, owner_id: true } },
            media_attachments: { include: { files: true } }
        }
    });
    console.log('All Reviews in system:', JSON.stringify(reviews, null, 2));
}

run().finally(() => prisma.$disconnect());
