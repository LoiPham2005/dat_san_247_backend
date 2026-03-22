import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- CLEANING STAFF DATA ---');
    
    // 1. Delete all invites
    const invitesDelete = await prisma.venue_staff_invites.deleteMany({});
    console.log(`Deleted ${invitesDelete.count} invitations.`);

    // 2. Delete all venue staff (excluding owners if necessary, but truncate usually clears all)
    // Actually, we want to clear everything to start fresh
    const staffDelete = await prisma.venue_staff.deleteMany({});
    console.log(`Deleted ${staffDelete.count} staff records.`);

    // 3. Reset is_venue_staff flag for ALL users to start fresh
    const userReset = await prisma.users.updateMany({
        where: { is_venue_staff: true } as any,
        data: { is_venue_staff: false } as any
    });
    console.log(`Reset is_venue_staff flag for ${userReset.count} users.`);

    console.log('Cleanup complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
