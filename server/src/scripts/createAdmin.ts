import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

async function main() {
  const email = process.argv[2] || env.INITIAL_ADMIN_EMAIL;
  const password = process.argv[3] || env.INITIAL_ADMIN_PASSWORD;
  const name = process.argv[4] || env.INITIAL_ADMIN_NAME;

  if (!email || !password) {
    console.error('Usage: tsx src/scripts/createAdmin.ts <email> <password> [name]');
    process.exit(1);
  }

  logger.info(`Setting up administrator account for: ${email}`);

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const existing = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } });

  if (existing) {
    const updated = await prisma.admin.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        name,
        role: 'SUPERADMIN',
      },
    });
    logger.info(`Administrator account updated successfully. Admin ID: ${updated.id}`);
  } else {
    const admin = await prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: 'SUPERADMIN',
      },
    });
    logger.info(`Administrator account created successfully. Admin ID: ${admin.id}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error creating admin user:', err);
  process.exit(1);
});
