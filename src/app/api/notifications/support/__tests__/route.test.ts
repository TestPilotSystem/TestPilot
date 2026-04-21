import { POST } from "../route";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";
import { createNotification } from "@/lib/notifications";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/middleware/guards", () => ({
  authGuard: jest.fn(),
}));

jest.mock("@/lib/notifications", () => ({
  createNotification: jest.fn(),
}));

const mockRequest = (body: object): Request =>
  ({ json: async () => body }) as unknown as Request;

describe("POST /api/notifications/support", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "2" } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      firstName: "Juan",
      lastName: "Pérez",
    });
    (prisma.user.findMany as jest.Mock).mockResolvedValue([{ id: 10 }, { id: 11 }]);
    (createNotification as jest.Mock).mockResolvedValue(undefined);
  });

  it("should return 401 if not authenticated", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });
    const res = await POST(mockRequest({ title: "Ayuda", messageBody: "Tengo un problema" }));
    expect(res.status).toBe(401);
  });

  it("should return 400 if title is missing", async () => {
    const res = await POST(mockRequest({ title: "", messageBody: "Mensaje" }));
    expect(res.status).toBe(400);
  });

  it("should return 400 if messageBody is missing", async () => {
    const res = await POST(mockRequest({ title: "Asunto", messageBody: "  " }));
    expect(res.status).toBe(400);
  });

  it("should send notifications to all admins and return 200", async () => {
    const res = await POST(mockRequest({ title: "Ayuda", messageBody: "Tengo un problema" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Mensaje enviado al soporte");
    expect(createNotification).toHaveBeenCalledTimes(2);
  });

  it("should use fallback sender name if user not found", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await POST(mockRequest({ title: "Ayuda", messageBody: "Problema" }));

    expect(res.status).toBe(200);
    expect(createNotification).toHaveBeenCalledWith(
      expect.any(Number),
      "ADMIN_MESSAGE",
      expect.objectContaining({ messageBody: expect.stringContaining("Un alumno") })
    );
  });

  it("should return 500 on unexpected error", async () => {
    (prisma.user.findMany as jest.Mock).mockRejectedValue(new Error("DB error"));
    const res = await POST(mockRequest({ title: "Ayuda", messageBody: "Mensaje" }));
    expect(res.status).toBe(500);
  });
});
