import { PrismaClient, UserRole, UserStatus, Language } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Telysee2002@', 10);

  await prisma.user.upsert({
    where: { email: 'admin@mhealth.rw' },
    update: {
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.admin,
      status: UserStatus.active,
      language: Language.en,
    },
    create: {
      name: 'Admin User',
      email: 'admin@mhealth.rw',
      password: hashedPassword,
      role: UserRole.admin,
      status: UserStatus.active,
      language: Language.en,
    },
  });

  console.log('Admin seed created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  
