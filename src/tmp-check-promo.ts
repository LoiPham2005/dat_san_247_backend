
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const promos = await prisma.promotions.findMany({
    orderBy: { created_at: 'desc' },
    take: 5
  })
  console.log('--- LATEST 5 PROMOTIONS ---')
  console.log(JSON.stringify(promos, null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
