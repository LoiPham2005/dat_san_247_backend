// database/seeders/seed.ts
import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../../modules/users/entities/user.entity';
import { SportType } from '../../modules/sport-types/entities/sport-type.entity';
import * as bcrypt from 'bcrypt';
import databaseConfig from '../../config/database.config';

async function seed() {
  const dataSource = new DataSource(databaseConfig() as any);
  await dataSource.initialize();

  console.log('🌱 Seeding database...');

  // Seed Users
  const userRepository = dataSource.getRepository(User);

  const users = [
    {
      email: 'admin@sportsbook.com',
      phone: '0901234567',
      passwordHash: await bcrypt.hash('Admin123!', 10),
      fullName: 'Admin User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
    },
    {
      email: 'owner@sportsbook.com',
      phone: '0901234568',
      passwordHash: await bcrypt.hash('Owner123!', 10),
      fullName: 'Chủ sân Nguyễn Văn A',
      role: UserRole.VENUE_OWNER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
    },
    {
      email: 'customer@sportsbook.com',
      phone: '0901234569',
      passwordHash: await bcrypt.hash('Customer123!', 10),
      fullName: 'Khách hàng Trần Thị B',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
    },
  ];

  for (const userData of users) {
    const existing = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existing) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`✓ Created user: ${userData.email}`);
    }
  }

  // Seed Sport Types
  const sportTypeRepository = dataSource.getRepository(SportType);

  const sportTypes = [
    {
      sportName: 'Bóng đá',
      slug: 'bong-da',
      isActive: true,
      displayOrder: 1,
    },
    {
      sportName: 'Cầu lông',
      slug: 'cau-long',
      isActive: true,
      displayOrder: 2,
    },
    {
      sportName: 'Tennis',
      slug: 'tennis',
      isActive: true,
      displayOrder: 3,
    },
    {
      sportName: 'Bóng rổ',
      slug: 'bong-ro',
      isActive: true,
      displayOrder: 4,
    },
    {
      sportName: 'Bóng chuyền',
      slug: 'bong-chuyen',
      isActive: true,
      displayOrder: 5,
    },
  ];

  for (const sportData of sportTypes) {
    const existing = await sportTypeRepository.findOne({
      where: { slug: sportData.slug },
    });

    if (!existing) {
      const sport = sportTypeRepository.create(sportData);
      await sportTypeRepository.save(sport);
      console.log(`✓ Created sport type: ${sportData.sportName}`);
    }
  }

  console.log('✅ Seeding completed!');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});