const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.users.findFirst();
    const venue = await prisma.venues.findFirst({ where: { slug: 't-hp-phng-khoang' } });
    const court = await prisma.courts.findFirst({ where: { venue_id: venue.id } });

    if (!user || !venue || !court) {
        console.log('Missing required data for seed', { user: !!user, venue: !!venue, court: !!court });
        return;
    }

    console.log('Seeding for user:', user.email);

    // 1. Seed Waitlist
    const waitlist = await prisma.booking_waitlist.create({
        data: {
            user_id: user.id,
            court_id: court.id,
            booking_date: new Date('2026-03-25'),
            start_time: new Date('1970-01-01T18:00:00Z'),
            end_time: new Date('1970-01-01T19:30:00Z'),
            priority: 1,
            status: 'WAITING'
        }
    });
    console.log('Created waitlist entry:', waitlist.id);

    // 2. Seed Recurring Booking
    const recurring = await prisma.recurring_bookings.create({
        data: {
            user_id: user.id,
            venue_id: venue.id,
            court_id: court.id,
            repeat_type: 'WEEKLY',
            start_time: new Date('1970-01-01T20:00:00Z'),
            end_time: new Date('1970-01-01T21:30:00Z'),
            start_date: new Date('2026-03-01'),
            is_active: true,
            recurring_days: {
                create: [
                    { day_of_week: 'MONDAY' },
                    { day_of_week: 'WEDNESDAY' },
                    { day_of_week: 'FRIDAY' }
                ]
            }
        }
    });
    console.log('Created recurring booking:', recurring.id);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
