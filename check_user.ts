import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'phamducloi919@gmail.com';
    const user = await prisma.users.findUnique({
        where: { email },
        include: { role: true }
    });

    if (!user) {
        console.log(`User ${email} not found`);
        return;
    }

    console.log('User found:', {
        id: user.id,
        email: user.email,
        role: user.role?.slug,
    });

    const staffRecords = await prisma.venue_staff.findMany({
        where: { user_id: user.id }
    });

    console.log('Staff records:', staffRecords);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
