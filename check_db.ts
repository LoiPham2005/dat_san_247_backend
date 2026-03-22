import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const invites = await prisma.venue_staff_invites.findMany({
        orderBy: { created_at: 'desc' }
    });

    console.log('--- ALL INVITES ---');
    invites.forEach(i => {
        console.log({
            id: i.id,
            email: i.invite_email,
            status: i.status,
            receiver_id: i.receiver_id,
            venue_id: i.venue_id
        });
    });

    const staff = await prisma.venue_staff.findMany({
        include: { users: { select: { email: true } } }
    });
    console.log('--- ALL STAFF ---');
    staff.forEach(s => {
        console.log({
            id: s.id,
            email: s.users.email,
            venue_id: s.venue_id,
            is_active: s.is_active
        });
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
