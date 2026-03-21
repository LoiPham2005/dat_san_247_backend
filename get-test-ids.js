const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const venue = await prisma.venues.findFirst({
        include: { courts: true }
  });
  console.log(JSON.stringify(venue, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
