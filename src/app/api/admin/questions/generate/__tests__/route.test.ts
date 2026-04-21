import { GET } from "../route";

jest.mock("@/lib/config", () => ({
  config: { ai: { baseUrl: "http://ai-service" } },
}));

global.fetch = jest.fn();

const mockRequest = (topic?: string): Request =>
  ({
    url: `http://localhost/api/admin/questions/generate${topic ? `?topic=${encodeURIComponent(topic)}` : ""}`,
  }) as unknown as Request;

describe("GET /api/admin/questions/generate", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 400 if topic param is missing", async () => {
    const res = await GET(mockRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/topic/i);
  });

  it("should return the generated question from AI service", async () => {
    const aiResponse = { question: "¿Cuál es la velocidad máxima?", options: ["50", "90", "120"] };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => aiResponse,
    });

    const res = await GET(mockRequest("Señales de tráfico"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(aiResponse);
  });

  it("should return 500 if AI service returns an error", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    const res = await GET(mockRequest("Señales"));
    expect(res.status).toBe(500);
  });

  it("should return 500 if fetch throws", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
    const res = await GET(mockRequest("Señales"));
    expect(res.status).toBe(500);
  });
});
