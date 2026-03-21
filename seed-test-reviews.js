const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customerId = '069bd5e9-f405-4dcd-b5d8-78cb1334e0f7';
  const venueId = '1f0238f6-7dcf-4e6c-8ae1-18af4c8d8987';
  const courtId = '710f2ce9-ed06-4fba-8b1d-68702335a64b';

  console.log('Creating completed bookings for test...');

  // Helper to create JS Date for Prisma Time field (it only cares about the time part if it's @db.Time)
  const time = (h, m = 0) => {
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const b1 = await prisma.bookings.create({
    data: {
      booking_code: 'BK-TEST-RE-1',
      check_in_code: '123456',
      customer_id: customerId,
      venue_id: venueId,
      court_id: courtId,
      booking_date: new Date('2026-03-20T00:00:00Z'),
      start_time: time(8),
      end_time: time(9),
      total_hours: 1,
      price_per_hour: 60000,
      sub_total: 60000,
      total_amount: 60000,
      status: 'COMPLETED',
      payment_status: 'PAID'
    }
  });

  const b2 = await prisma.bookings.create({
    data: {
      booking_code: 'BK-TEST-RE-2',
      check_in_code: '654321',
      customer_id: customerId,
      venue_id: venueId,
      court_id: courtId,
      booking_date: new Date('2026-03-19T00:00:00Z'),
      start_time: time(17),
      end_time: time(18, 30),
      total_hours: 1.5,
      price_per_hour: 60000,
      sub_total: 90000,
      total_amount: 90000,
      status: 'COMPLETED',
      payment_status: 'PAID'
    }
  });

  console.log('Done! Created 2 completed bookings.');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
