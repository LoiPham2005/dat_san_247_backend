const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
    const v = await prisma.venues.findFirst({
        where: {slug: 't-hp-phng-khoang'}, 
        include: {amenities: true, courts: {include: {amenities: true}}}
    }); 
    console.log(JSON.stringify({venue_am: v?.amenities, courts_am: v?.courts.map(c => c.amenities)}, null, 2)); 
} 
main().finally(() => prisma.$disconnect());
