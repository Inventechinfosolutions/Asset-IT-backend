import { config as loadEnv } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import { UserProfile } from '../users/entities/user-profile.entity';
import { User, UserRole } from '../users/entities/user.entity';

loadEnv();

const ADMIN = {
  displayName: 'SuperAdmin',
  aliasName: 'superadmin',
  password: 'Admin@123',
  role: UserRole.ADMIN,
};

async function seedAdmin() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'AdminUsers',
    entities: [User, UserProfile],
    synchronize: false,
  });

  await dataSource.initialize();

  try {
    const usersRepo = dataSource.getRepository(User);
    const profilesRepo = dataSource.getRepository(UserProfile);

    const existing = await usersRepo.findOne({
      where: { aliasName: ADMIN.aliasName },
      relations: ['profile'],
    });

    if (existing) {
      console.log(`Admin already exists: ${ADMIN.aliasName}`);
      return;
    }

    const password = await bcrypt.hash(ADMIN.password, 10);
    const admin = await usersRepo.save(
      usersRepo.create({
        aliasName: ADMIN.aliasName,
        password,
        role: ADMIN.role,
        isActive: true,
      }),
    );

    await profilesRepo.save(
      profilesRepo.create({
        userId: admin.id,
        aliasName: ADMIN.aliasName,
        firstName: ADMIN.displayName,
        lastName: null,
        mobile: null,
        department: 'Administration',
        empNo: null,
      }),
    );

    console.log('Admin seeded successfully');
    console.log(`  Alias name: ${ADMIN.aliasName}`);
    console.log(`  Password: ${ADMIN.password}`);
  } finally {
    await dataSource.destroy();
  }
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
