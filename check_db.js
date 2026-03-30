const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const venues = await prisma.venues.findMany();
        console.log(JSON.stringify(venues.map(v => ({
            id: v.id, 
            name: v.name, 
            status: v.status, 
            is_active: v.is_active,
            lat: v.latitude, 
            lng: v.longitude
        })), null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
