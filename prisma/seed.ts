import { PrismaClient, Role, RequestStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Start seeding...");

  const DEFAULT_PASSWORD = "Password123!";
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // Admin account
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@testpilot.com" },
    update: { password: hashedPassword },
    create: {
      email: "admin@testpilot.com",
      password: hashedPassword,
      role: Role.ADMIN,
      mustChangePassword: true,
      firstName: "Super",
      lastName: "Admin",
    },
  });

  await prisma.request.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      userId: adminUser.id,
      status: RequestStatus.APPROVED,
      adminNotes: "Sistema: Cuenta de administrador inicial.",
    },
  });

  // Current students
  const studentsData = [
    {
      email: "maria.garcia@test.com",
      firstName: "Maria",
      lastName: "Garcia",
      dni: "12345678A",
    },
    {
      email: "juan.perez@test.com",
      firstName: "Juan",
      lastName: "Perez",
      dni: "87654321B",
    },
  ];

  for (const s of studentsData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        password: hashedPassword,
        role: Role.STUDENT,
        firstName: s.firstName,
        lastName: s.lastName,
        dni: s.dni,
      },
    });

    await prisma.request.upsert({
      where: { id: user.id + 100 },
      update: {},
      create: {
        userId: user.id,
        status: RequestStatus.APPROVED,
        adminNotes: "Sistema: Usuario de prueba aceptado.",
      },
    });
  }

  // Pending requests
  const pendingData = [
    {
      email: "ana.lopez@test.com",
      firstName: "Ana",
      lastName: "Lopez",
      dni: "11223344C",
    },
  ];

  for (const p of pendingData) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        password: hashedPassword,
        role: Role.STUDENT,
        firstName: p.firstName,
        lastName: p.lastName,
        dni: p.dni,
      },
    });

    await prisma.request.upsert({
      where: { id: user.id + 200 },
      update: {},
      create: {
        userId: user.id,
        status: RequestStatus.PENDING,
      },
    });
  }

  // Topic seeding
  const topics = [
    ...Array.from({ length: 17 }, (_, i) => `Tema ${i + 1}`),
    "Anexo: Puntos",
  ];

  for (const topicName of topics) {
    await prisma.topic.upsert({
      where: { name: topicName },
      update: {},
      create: { name: topicName },
    });
  }

  console.log(
    `✅ Created admin, ${studentsData.length} active students, ${pendingData.length} pending requests and ${topics.length} topics.`
  );
  console.log("✨ Seeding finished.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
