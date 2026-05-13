import { GET, DELETE, PATCH } from "../route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    test: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("Driving Test Dynamic Route /api/admin/driving-tests/[id]", () => {
  const TEST_ID = "cmjww3ltm000djs5o5ikomhwf";

  const mockTest = {
    id: TEST_ID,
    topicId: "topic-1",
    topic: { id: "topic-1", name: "Seguridad Vial" },
    questions: [{ id: "q1", enunciado: "Pregunta 1", respuestaCorrecta: "A" }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return 200 and the test data if found", async () => {
      (prisma.test.findUnique as jest.Mock).mockResolvedValue(mockTest);

      const params = Promise.resolve({ id: TEST_ID });
      const req = {} as NextRequest;

      const response = await GET(req, { params });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.id).toBe(TEST_ID);
      expect(body.questions).toHaveLength(1);
      expect(prisma.test.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_ID },
        include: { topic: true, questions: true },
      });
    });

    it("should return 404 if the test does not exist", async () => {
      (prisma.test.findUnique as jest.Mock).mockResolvedValue(null);

      const params = Promise.resolve({ id: "invalid-id" });
      const req = {} as NextRequest;

      const response = await GET(req, { params });
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe("Test no encontrado");
    });

    it("should return 500 if prisma fails", async () => {
      (prisma.test.findUnique as jest.Mock).mockRejectedValue(
        new Error("DB Error")
      );

      const params = Promise.resolve({ id: TEST_ID });
      const req = {} as NextRequest;

      const response = await GET(req, { params });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Error al obtener el test");
    });
  });

  describe("PATCH", () => {
    it("should return 200 and updated test when making a test visible", async () => {
      const updatedTest = { ...mockTest, isVisible: true };
      (prisma.test.update as jest.Mock).mockResolvedValue(updatedTest);

      const params = Promise.resolve({ id: TEST_ID });
      const req = {
        json: async () => ({ isVisible: true }),
      } as unknown as NextRequest;

      const response = await PATCH(req, { params });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.isVisible).toBe(true);
      expect(prisma.test.update).toHaveBeenCalledWith({
        where: { id: TEST_ID },
        data: { isVisible: true },
      });
    });

    it("should return 200 and updated test when hiding a test", async () => {
      const updatedTest = { ...mockTest, isVisible: false };
      (prisma.test.update as jest.Mock).mockResolvedValue(updatedTest);

      const params = Promise.resolve({ id: TEST_ID });
      const req = {
        json: async () => ({ isVisible: false }),
      } as unknown as NextRequest;

      const response = await PATCH(req, { params });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.isVisible).toBe(false);
    });

    it("should return 500 if update fails", async () => {
      (prisma.test.update as jest.Mock).mockRejectedValue(new Error("Update Error"));

      const params = Promise.resolve({ id: TEST_ID });
      const req = {
        json: async () => ({ isVisible: true }),
      } as unknown as NextRequest;

      const response = await PATCH(req, { params });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Error al actualizar la visibilidad del test");
    });
  });

  describe("DELETE", () => {
    it("should return 200 if the test is deleted successfully", async () => {
      (prisma.test.delete as jest.Mock).mockResolvedValue(mockTest);

      const params = Promise.resolve({ id: TEST_ID });
      const req = {} as NextRequest;

      const response = await DELETE(req, { params });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe("Test eliminado correctamente");
      expect(prisma.test.delete).toHaveBeenCalledWith({
        where: { id: TEST_ID },
      });
    });

    it("should return 500 if deletion fails", async () => {
      (prisma.test.delete as jest.Mock).mockRejectedValue(
        new Error("Delete Error")
      );

      const params = Promise.resolve({ id: TEST_ID });
      const req = {} as NextRequest;

      const response = await DELETE(req, { params });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Error al eliminar el test");
    });
  });
});
