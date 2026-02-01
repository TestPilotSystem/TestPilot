import { POST } from "../route";

global.fetch = jest.fn();

describe("Chat Tutor Route /api/estudiante/chat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should return 200 and data when AI responds successfully", async () => {
      const mockResponse = { response: "Esta es la respuesta del tutor" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const mockRequest = {
        json: async () => ({ question: "¿Qué es una rotonda?" }),
      } as unknown as Request;

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/chat/"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: "¿Qué es una rotonda?" }),
        })
      );
    });

    it("should forward optional parameters to the AI API", async () => {
      const mockResponse = { response: "Respuesta formal" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const requestBody = {
        question: "¿Qué es un ceda el paso?",
        topic: "señales",
        tone: "formal",
        user_name: "Juan",
        history: [{ role: "user", content: "Hola" }],
      };

      const mockRequest = {
        json: async () => requestBody,
      } as unknown as Request;

      const response = await POST(mockRequest);

      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/chat/"),
        expect.objectContaining({
          body: JSON.stringify(requestBody),
        })
      );
    });

    it("should return 400 if question is missing", async () => {
      const mockRequest = {
        json: async () => ({ topic: "señales" }),
      } as unknown as Request;

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("El campo 'question' es requerido");
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should return 500 if AI API returns error status", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const mockRequest = {
        json: async () => ({ question: "¿Qué es un STOP?" }),
      } as unknown as Request;

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Error al comunicarse con el tutor IA");
    });

    it("should return 500 if there is a network error", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network Fail"));

      const mockRequest = {
        json: async () => ({ question: "¿Qué es un STOP?" }),
      } as unknown as Request;

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Error al comunicarse con el tutor IA");
    });
  });
});
