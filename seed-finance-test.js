const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customerId = '069bd5e9-f405-4dcd-b5d8-78cb1334e0f7';
  const venueId = '1f0238f6-7dcf-4e6c-8ae1-18af4c8d8987';
  const courtId = '710f2ce9-ed06-4fba-8b1d-68702335a64b';

  console.log('Creating wallet, transactions and invoices for test...');

  // 1. Create Wallet
  const wallet = await prisma.wallets.upsert({
    where: { user_id: customerId },
    update: { balance: 1550000 },
    create: {
      user_id: customerId,
      balance: 1550000,
      locked_balance: 0,
      is_active: true
    }
  });

  // 2. Create Completed Bookings (if not exist)
  const time = (h, m = 0) => {
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const booking1 = await prisma.bookings.upsert({
    where: { booking_code: 'BK-TEST-RE-1' },
    update: { status: 'COMPLETED' },
    create: {
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

  // 3. Create Transactions
  await prisma.transactions.createMany({
    data: [
      {
        user_id: customerId,
        type: 'DEPOSIT',
        amount: 2000000,
        balance_after: 2000000,
        status: 'COMPLETED',
        description: 'Nạp tiền vào ví qua VNPAY',
        created_at: new Date(Date.now() - 86400000)
      },
      {
        user_id: customerId,
        type: 'PAYMENT',
        amount: -450000,
        balance_after: 1550000,
        status: 'COMPLETED',
        description: `Thanh toán đặt sân ${booking1.booking_code}`,
        booking_id: booking1.id,
        created_at: new Date()
      }
    ],
    skipDuplicates: true
  });

  // 4. Create Invoice
  const tx = await prisma.transactions.findFirst({
        where: { booking_id: booking1.id }
  });

  if (tx) {
      await prisma.invoices.upsert({
        where: { booking_id: booking1.id },
        update: {},
        create: {
          invoice_number: 'HD-2026-0320-0001',
          booking_id: booking1.id,
          transaction_id: tx.id,
          customer_id: customerId,
          amount: 60000,
          tax_amount: 6000,
          status: 'PAID',
          issued_at: new Date()
        }
      });
  }

  console.log('Done! Created wallet, transactions, and invoices.');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
