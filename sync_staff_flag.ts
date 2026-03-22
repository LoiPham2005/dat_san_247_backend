import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- SYNCING IS_VENUE_STAFF FLAG ---');
    
    // Find all users who are in the venue_staff table and active
    const activeStaff = await prisma.venue_staff.findMany({
        where: { is_active: true },
        select: { user_id: true }
    });

    const userIds = [...new Set(activeStaff.map(s => s.user_id))];

    if (userIds.length === 0) {
        console.log('No active staff found to sync.');
    } else {
        const result = await prisma.users.updateMany({
            where: { id: { in: userIds } },
            data: { is_venue_staff: true } as any
        });
        console.log(`Synced ${result.count} users to is_venue_staff = true`);
    }

    // Also specifically fix the user phamducloi919@gmail.com if they were added
    const testUser = await prisma.users.findUnique({
        where: { email: 'phamducloi919@gmail.com' }
    });

    if (testUser) {
        // If they are not in venue_staff, let's FORCE them for testing if the user wants
        // But better to just sync based on table.
        console.log(`User ${testUser.email} is_venue_staff status: ${(testUser as any).is_venue_staff}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
