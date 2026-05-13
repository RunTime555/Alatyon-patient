const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // 1. Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@alatyon.com' },
    update: {},
    create: {
      email: 'admin@alatyon.com',
      name: 'Rehmet Admin',
      password: hashedPassword,
      role: 'Admin',
    },
  });

  // 2. Doctor
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@alatyon.com' },
    update: {},
    create: {
      email: 'doctor@alatyon.com',
      name: 'Dr. Abebe',
      password: hashedPassword,
      role: 'Doctor',
    },
  });

  // 3. Lab Technician 
  const labTech = await prisma.user.upsert({
    where: { email: 'lab@alatyon.com' },
    update: {},
    create: {
      email: 'lab@alatyon.com',
      name: 'Lab Technician',
      password: hashedPassword,
      role: 'LabTech', // ሮሉ በትክክል LabTech መሆኑን አረጋግጪ
    },
  });

  console.log("Seeding finished successfully:");
  console.log({ admin: admin.email, doctor: doctor.email, labTech: labTech.email });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });