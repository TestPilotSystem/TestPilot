import { PATCH, DELETE } from "../route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    question: {
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("PATCH & DELETE /api/admin/questions/[id]", () => {
  const QUESTION_ID = "q-123";
  const mockUpdateData = {
    enunciado: "¿Qué significa esta señal actualizada?",
    opciones: { A: "Stop", B: "Siga" },
    respuestaCorrecta: "A",
    explicacion: "Nueva explicación",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("PATCH", () => {
    it("should update a question successfully", async () => {
      const updatedQuestion = { id: QUESTION_ID, ...mockUpdateData };
      (prisma.question.update as jest.Mock).mockResolvedValue(updatedQuestion);

      const params = Promise.resolve({ id: QUESTION_ID });
      const mockRequest = {
        json: async () => mockUpdateData,
      } as unknown as Request;

      const response = await PATCH(mockRequest, { params });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(updatedQuestion);
      expect(prisma.question.update).toHaveBeenCalledWith({
        where: { id: QUESTION_ID },
        data: mockUpdateData,
      });
    });

    it("should return 500 if update fails", async () => {
      (prisma.question.update as jest.Mock).mockRejectedValue(
        new Error("Update failed")
      );

      const params = Promise.resolve({ id: QUESTION_ID });
      const mockRequest = {
        json: async () => mockUpdateData,
      } as unknown as Request;

      const response = await PATCH(mockRequest, { params });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Error al actualizar la pregunta");
    });
  });

  describe("DELETE", () => {
    it("should delete a question successfully", async () => {
      (prisma.question.delete as jest.Mock).mockResolvedValue({
        id: QUESTION_ID,
      });

      const params = Promise.resolve({ id: QUESTION_ID });
      const mockRequest = {} as unknown as Request;

      const response = await DELETE(mockRequest, { params });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe("Pregunta eliminada");
      expect(prisma.question.delete).toHaveBeenCalledWith({
        where: { id: QUESTION_ID },
      });
    });

    it("should return 500 if delete fails", async () => {
      (prisma.question.delete as jest.Mock).mockRejectedValue(
        new Error("Delete failed")
      );

      const params = Promise.resolve({ id: QUESTION_ID });
      const mockRequest = {} as unknown as Request;

      const response = await DELETE(mockRequest, { params });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Error al eliminar la pregunta");
    });
  });
});
