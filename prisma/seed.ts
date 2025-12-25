import { PrismaClient, Role, RequestStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  const ADMIN_PASSWORD = "Admin123!";
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@testpilot.com" },
    update: {
      password: hashedPassword,
    },
    create: {
      email: "admin@testpilot.com",
      password: hashedPassword,
      role: Role.ADMIN,
      mustChangePassword: true,
      firstName: "Super",
      lastName: "Admin",
    },
  });

  // Approved request for the admin user
  const existingRequest = await prisma.request.findFirst({
    where: { userId: adminUser.id },
  });

  if (!existingRequest) {
    await prisma.request.create({
      data: {
        userId: adminUser.id,
        status: RequestStatus.APPROVED,
        adminNotes: "Sistema: Cuenta de administrador inicial.",
      },
    });
  }

  console.log(
    `Created admin user with id: ${adminUser.id} and password: ${ADMIN_PASSWORD}`
  );
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error("Seeding failed: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
