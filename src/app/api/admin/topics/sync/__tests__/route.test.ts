import { GET, POST } from "../route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    topic: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: "valid-admin-token" })),
  })),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(() => ({ role: "ADMIN" })),
}));

global.fetch = jest.fn();

describe("Topics Sync Route /api/admin/topics/sync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should sync new topics from AI service", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ topics: ["Tema 1", "Tema 2"] }),
      });

      (prisma.topic.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (prisma.topic.create as jest.Mock).mockResolvedValue({});
      (prisma.topic.findMany as jest.Mock).mockResolvedValue([
        { id: "1", name: "Tema 1" },
        { id: "2", name: "Tema 2" },
      ]);

      const response = await POST();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.synced).toBe(2);
      expect(body.topics).toHaveLength(2);
    });

    it("should not create existing topics", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ topics: ["Tema 1"] }),
      });

      (prisma.topic.findFirst as jest.Mock).mockResolvedValue({ id: "1", name: "Tema 1" });
      (prisma.topic.findMany as jest.Mock).mockResolvedValue([{ id: "1", name: "Tema 1" }]);

      const response = await POST();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.synced).toBe(0);
      expect(prisma.topic.create).not.toHaveBeenCalled();
    });

    it("should return 503 if AI service is unavailable", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const response = await POST();
      const body = await response.json();

      expect(response.status).toBe(503);
      expect(body.error).toContain("No se pudo conectar");
    });
  });

  describe("GET", () => {
    it("should return topics from database", async () => {
      (prisma.topic.findMany as jest.Mock).mockResolvedValue([
        { id: "1", name: "Tema 1" },
        { id: "2", name: "Tema 2" },
      ]);

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.topics).toHaveLength(2);
    });
  });
});
