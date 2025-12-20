import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedUsers(dataSource: DataSource) {
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
      fullName: 'Venue Owner',
      role: UserRole.VENUE_OWNER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
    },
    {
      email: 'customer@sportsbook.com',
      phone: '0901234569',
      passwordHash: await bcrypt.hash('Customer123!', 10),
      fullName: 'Customer User',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
    },
  ];

  for (const userData of users) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`Created user: ${userData.email}`);
    }
  }
}