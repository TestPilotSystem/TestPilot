import { POST, DELETE } from "../route";

global.fetch = jest.fn();

describe("AI Admin Route /api/admin/ai/config", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should return 200 and data when Python backend responds successfully", async () => {
      const mockSuccessResponse = { success: true, filename: "manual.pdf" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      const mockFormData = new FormData();
      mockFormData.append("file", new Blob(["content"]), "manual.pdf");

      const mockRequest = {
        formData: async () => mockFormData,
      } as unknown as Request;

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(mockSuccessResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/admin/ai/upload-manual",
        expect.objectContaining({
          method: "POST",
          body: mockFormData,
        })
      );
    });

    it("should return 500 if Python backend returns an error status", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const mockRequest = {
        formData: async () => new FormData(),
      } as unknown as Request;

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.message).toBe("Error de conexión con el backend");
    });

    it("should return 500 if there is a network error", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network Fail"));

      const mockRequest = {
        formData: async () => new FormData(),
      } as unknown as Request;

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.message).toBe("Error de conexión con el backend");
    });
  });

  describe("DELETE", () => {
    it("should return 200 when reset is successful", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      const response = await DELETE();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe("Base de datos reseteada");
      expect(global.fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/admin/ai/reset-db",
        { method: "DELETE" }
      );
    });

    it("should return 500 if reset fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const response = await DELETE();
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.message).toBe("Error al resetear");
    });
  });
});
