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
      avatarId: "avatar-admin",
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

  console.log("✅ Admin created");

  // Topics
  const topicsData = [
    { id: "topic-1", name: "Tema 1" },
    { id: "topic-2", name: "Tema 2" },
    { id: "topic-3", name: "Tema 3" },
    { id: "topic-4", name: "Tema 4" },
  ];

  for (const topic of topicsData) {
    await prisma.topic.upsert({
      where: { id: topic.id },
      update: { name: topic.name },
      create: topic,
    });
  }

  console.log("✅ Topics created");

  // Sample questions for each topic
  const questionsData: Record<string, Array<{ enunciado: string; opciones: Record<string, string>; respuestaCorrecta: string; explicacion: string }>> = {
    "topic-1": [
      {
        enunciado: "¿Qué indica una señal de STOP?",
        opciones: { A: "Ceda el paso", B: "Detenerse completamente", C: "Reducir velocidad", D: "Giro obligatorio" },
        respuestaCorrecta: "Detenerse completamente",
        explicacion: "La señal de STOP obliga a detenerse completamente antes de continuar.",
      },
      {
        enunciado: "¿Qué forma tiene una señal de peligro?",
        opciones: { A: "Cuadrada", B: "Circular", C: "Triangular", D: "Rectangular" },
        respuestaCorrecta: "Triangular",
        explicacion: "Las señales de peligro tienen forma triangular con el vértice hacia arriba.",
      },
      {
        enunciado: "¿Qué color predomina en las señales de prohibición?",
        opciones: { A: "Azul", B: "Verde", C: "Rojo", D: "Amarillo" },
        respuestaCorrecta: "Rojo",
        explicacion: "Las señales de prohibición utilizan el color rojo como color predominante.",
      },
      {
        enunciado: "¿Qué indica una señal con fondo azul?",
        opciones: { A: "Prohibición", B: "Obligación", C: "Peligro", D: "Información" },
        respuestaCorrecta: "Obligación",
        explicacion: "Las señales con fondo azul indican obligación o información.",
      },
      {
        enunciado: "¿Qué significa una señal con una P blanca sobre fondo azul?",
        opciones: { A: "Prohibido aparcar", B: "Aparcamiento permitido", C: "Paso de peatones", D: "Parada de bus" },
        respuestaCorrecta: "Aparcamiento permitido",
        explicacion: "Esta señal indica zona de aparcamiento permitido.",
      },
    ],
    "topic-2": [
      {
        enunciado: "En una intersección sin señalizar, ¿quién tiene prioridad?",
        opciones: { A: "El que viene por la izquierda", B: "El que viene por la derecha", C: "El primero que llegue", D: "El vehículo más grande" },
        respuestaCorrecta: "El que viene por la derecha",
        explicacion: "En intersecciones sin señalizar, tiene prioridad el vehículo que viene por la derecha.",
      },
      {
        enunciado: "¿Quién tiene prioridad en una rotonda?",
        opciones: { A: "El que entra", B: "El que está dentro", C: "El que va más rápido", D: "El vehículo más grande" },
        respuestaCorrecta: "El que está dentro",
        explicacion: "Los vehículos que circulan dentro de la rotonda tienen prioridad sobre los que entran.",
      },
      {
        enunciado: "¿Qué vehículos tienen siempre prioridad?",
        opciones: { A: "Taxis", B: "Autobuses", C: "Ambulancias con sirena", D: "Motos" },
        respuestaCorrecta: "Ambulancias con sirena",
        explicacion: "Los vehículos de emergencia con señales luminosas y acústicas tienen siempre prioridad.",
      },
      {
        enunciado: "En una vía de doble sentido con un solo carril por sentido, ¿quién tiene prioridad en un estrechamiento?",
        opciones: { A: "El que sube", B: "El que baja", C: "El que llegue primero", D: "Depende de la señalización" },
        respuestaCorrecta: "Depende de la señalización",
        explicacion: "La prioridad en estrechamientos depende de la señalización existente.",
      },
      {
        enunciado: "¿Debe ceder el paso un vehículo que sale de una gasolinera?",
        opciones: { A: "No", B: "Solo si hay señal", C: "Siempre", D: "Solo a peatones" },
        respuestaCorrecta: "Siempre",
        explicacion: "Los vehículos que salen de un establecimiento deben ceder el paso siempre.",
      },
    ],
    "topic-3": [
      {
        enunciado: "¿Cuál es la velocidad máxima en autopista para turismos?",
        opciones: { A: "100 km/h", B: "110 km/h", C: "120 km/h", D: "130 km/h" },
        respuestaCorrecta: "120 km/h",
        explicacion: "La velocidad máxima en autopista para turismos es de 120 km/h.",
      },
      {
        enunciado: "¿Cuál es la velocidad máxima en zona urbana?",
        opciones: { A: "30 km/h", B: "40 km/h", C: "50 km/h", D: "60 km/h" },
        respuestaCorrecta: "50 km/h",
        explicacion: "La velocidad máxima genérica en zona urbana es de 50 km/h, aunque puede variar.",
      },
      {
        enunciado: "La distancia de frenado depende de:",
        opciones: { A: "Solo la velocidad", B: "Solo el estado de los frenos", C: "Velocidad, estado del vehículo y la vía", D: "Solo el tipo de vehículo" },
        respuestaCorrecta: "Velocidad, estado del vehículo y la vía",
        explicacion: "La distancia de frenado depende de múltiples factores incluyendo velocidad, estado del vehículo y condiciones de la vía.",
      },
      {
        enunciado: "¿Qué distancia de seguridad mínima debe mantener con el vehículo de delante?",
        opciones: { A: "10 metros", B: "La que permita reaccionar", C: "50 metros siempre", D: "No hay mínimo" },
        respuestaCorrecta: "La que permita reaccionar",
        explicacion: "La distancia de seguridad debe ser suficiente para reaccionar ante cualquier imprevisto.",
      },
      {
        enunciado: "Al duplicar la velocidad, la distancia de frenado:",
        opciones: { A: "Se duplica", B: "Se triplica", C: "Se cuadruplica", D: "Permanece igual" },
        respuestaCorrecta: "Se cuadruplica",
        explicacion: "La distancia de frenado aumenta con el cuadrado de la velocidad.",
      },
    ],
    "topic-4": [
      {
        enunciado: "¿Cuándo debe usar las luces de cruce?",
        opciones: { A: "Solo de noche", B: "De noche y en túneles", C: "Siempre que circule", D: "Solo con niebla" },
        respuestaCorrecta: "Siempre que circule",
        explicacion: "Es obligatorio circular con las luces de cruce encendidas en todo momento.",
      },
      {
        enunciado: "¿Qué debe hacer si nota sueño conduciendo?",
        opciones: { A: "Abrir la ventana", B: "Poner música alta", C: "Parar y descansar", D: "Beber café" },
        respuestaCorrecta: "Parar y descansar",
        explicacion: "Lo más seguro es detener el vehículo y descansar cuando se nota sueño.",
      },
      {
        enunciado: "¿Cuál es la tasa máxima de alcohol para conductores noveles?",
        opciones: { A: "0.5 g/l", B: "0.3 g/l", C: "0.15 g/l", D: "0.0 g/l" },
        respuestaCorrecta: "0.15 g/l",
        explicacion: "Los conductores noveles tienen un límite de 0.15 g/l de alcohol en sangre.",
      },
      {
        enunciado: "¿Cada cuántos kilómetros se recomienda hacer una parada en viajes largos?",
        opciones: { A: "Cada 100 km", B: "Cada 200 km", C: "Cada 300 km", D: "No es necesario" },
        respuestaCorrecta: "Cada 200 km",
        explicacion: "Se recomienda hacer pausas cada 2 horas o 200 km aproximadamente.",
      },
      {
        enunciado: "El uso del cinturón de seguridad es obligatorio:",
        opciones: { A: "Solo en autopista", B: "Solo en asientos delanteros", C: "En todos los asientos", D: "Solo para el conductor" },
        respuestaCorrecta: "En todos los asientos",
        explicacion: "El uso del cinturón de seguridad es obligatorio en todos los asientos del vehículo.",
      },
    ],
  };

  // Create tests with questions for each topic
  for (const topic of topicsData) {
    const test = await prisma.test.create({
      data: {
        topicId: topic.id,
        questions: {
          create: questionsData[topic.id].map((q) => ({
            enunciado: q.enunciado,
            opciones: q.opciones,
            respuestaCorrecta: q.respuestaCorrecta,
            explicacion: q.explicacion,
          })),
        },
      },
    });
    console.log(`✅ Test created for ${topic.name} with ${questionsData[topic.id].length} questions`);
  }

  // Students with statistics
  const studentsData = [
    {
      email: "maria.garcia@test.com",
      firstName: "Maria",
      lastName: "Garcia",
      dni: "12345678A",
      avatarId: "avatar-1",
    },
    {
      email: "juan.perez@test.com",
      firstName: "Juan",
      lastName: "Perez",
      dni: "87654321B",
      avatarId: "avatar-2",
    },
    {
      email: "carlos.ruiz@test.com",
      firstName: "Carlos",
      lastName: "Ruiz",
      dni: "55667788D",
      avatarId: "avatar-3",
    },
  ];

  const allTests = await prisma.test.findMany({ include: { questions: true } });

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
        avatarId: s.avatarId,
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

    // Create sample test attempts for each student (simulating statistics)
    for (let i = 0; i < 2; i++) {
      for (const test of allTests) {
        // Random score between 50-100
        const score = Math.floor(Math.random() * 51) + 50;
        const timeSpent = Math.floor(Math.random() * 900) + 300; // 5-20 minutes

        const userTest = await prisma.userTest.create({
          data: {
            userId: user.id,
            testId: test.id,
            score,
            timeSpentSeconds: timeSpent,
            completed: true,
            completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date in last week
            responses: {
              create: test.questions.map((q) => {
                const isCorrect = Math.random() > 0.3; // 70% chance correct
                return {
                  questionId: q.id,
                  respuestaDada: isCorrect ? q.respuestaCorrecta : "Respuesta incorrecta",
                  esCorrecta: isCorrect,
                };
              }),
            },
          },
        });
      }
    }

    console.log(`✅ Created student ${s.firstName} with test history`);
  }

  // Pending requests (user without statistics)
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

  // Create ChatConfig
  await prisma.chatConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      tone: "formal",
      useStudentNames: true,
    },
  });

  console.log("✅ ChatConfig created");
  console.log(`✅ Created admin, ${studentsData.length} active students with history, ${pendingData.length} pending requests.`);
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
