import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const venues = await prisma.venues.findMany({
        take: 5,
        select: { id: true, name: true }
    });
    console.log('Venues:', JSON.stringify(venues, null, 2));

    const users = await prisma.users.findMany({
        where: { role: { slug: 'venue_staff' } },
        include: { role: true, venue_staff: true }
    });
    console.log('Venue Staff Users:', JSON.stringify(users, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
