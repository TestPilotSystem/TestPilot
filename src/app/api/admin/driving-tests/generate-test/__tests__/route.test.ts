import { POST } from "../route";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

jest.mock("next/headers", () => {
  const cookieStore = {
    get: jest.fn(),
  };
  return {
    cookies: jest.fn(async () => cookieStore),
  };
});

jest.mock("@/lib/prisma", () => ({
  prisma: {
    test: {
      create: jest.fn(),
    },
  },
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

// Global mock for fetch
global.fetch = jest.fn();

describe("POST /api/admin/driving-tests/generate-test", () => {
  const JWT_SECRET = process.env.JWT_SECRET || "a_clave_secreta";
  const MOCK_TOPIC_ID = "topic_123";
  const MOCK_TOPIC_NAME = "Tema 1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Negative Cases ---

  it("should return 401 if auth_token cookie is missing", async () => {
    const cookieStore = await cookies();
    (cookieStore.get as jest.Mock).mockReturnValue(undefined);

    const req = { json: async () => ({}) } as Request;
    const response = await POST(req);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toContain("sesión no encontrada");
  });

  it("should return 401 if JWT is invalid", async () => {
    const cookieStore = await cookies();
    (cookieStore.get as jest.Mock).mockReturnValue({ value: "invalid_token" });
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const req = { json: async () => ({}) } as Request;
    const response = await POST(req);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Sesión expirada o inválida",
    });
  });

  it("should return 403 if user is not an ADMIN", async () => {
    const cookieStore = await cookies();
    (cookieStore.get as jest.Mock).mockReturnValue({ value: "valid_token" });
    (jwt.verify as jest.Mock).mockReturnValue({ role: "STUDENT", id: 1 });

    const req = { json: async () => ({}) } as Request;
    const response = await POST(req);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "No tienes permisos de administrador",
    });
  });

  it("should return 500 if Python API fails", async () => {
    const cookieStore = await cookies();
    (cookieStore.get as jest.Mock).mockReturnValue({ value: "valid_token" });
    (jwt.verify as jest.Mock).mockReturnValue({ role: "ADMIN", id: 1 });

    // Simulate failed fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const req = {
      json: async () => ({
        topicId: MOCK_TOPIC_ID,
        topicName: MOCK_TOPIC_NAME,
        numQuestions: 10,
      }),
    } as Request;

    const response = await POST(req);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "La IA de Python ha fallado o está tardando demasiado",
    });
  });

  // --- Positive Case ---

  it("should create a test and return 200 on success", async () => {
    const cookieStore = await cookies();
    (cookieStore.get as jest.Mock).mockReturnValue({ value: "valid_token" });
    (jwt.verify as jest.Mock).mockReturnValue({ role: "ADMIN", id: 1 });

    const mockAiResponse = {
      test: [
        {
          pregunta: "¿Cual es la velocidad máxima?",
          opciones: ["100", "120", "90"],
          respuesta_correcta: "120",
          explicacion: "En autopista es 120.",
        },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAiResponse,
    });

    (prisma.test.create as jest.Mock).mockResolvedValue({
      id: "new_test_uuid",
    });

    const req = {
      json: async () => ({
        topicId: MOCK_TOPIC_ID,
        topicName: MOCK_TOPIC_NAME,
        numQuestions: 1,
      }),
    } as Request;

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.testId).toBe("new_test_uuid");

    // Verify that prisma.test.create was called with correct data
    expect(prisma.test.create).toHaveBeenCalledWith({
      data: {
        topicId: MOCK_TOPIC_ID,
        questions: {
          create: [
            {
              enunciado: mockAiResponse.test[0].pregunta,
              opciones: mockAiResponse.test[0].opciones,
              respuestaCorrecta: mockAiResponse.test[0].respuesta_correcta,
              explicacion: mockAiResponse.test[0].explicacion,
            },
          ],
        },
      },
    });
  });
});
