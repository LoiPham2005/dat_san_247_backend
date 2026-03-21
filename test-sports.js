const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const sports = await prisma.sport_types.findMany();
    console.log(JSON.stringify(sports, null, 2));
}

main().finally(() => prisma.$disconnect());
