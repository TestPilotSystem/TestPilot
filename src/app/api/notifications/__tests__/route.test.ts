import { GET, PATCH } from "../route";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    notification: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/middleware/guards", () => ({
  authGuard: jest.fn(),
}));

const mockAuth = { payload: { id: "1" } };
const mockRequest = (url: string, body?: object): Request =>
  ({
    url,
    json: async () => body,
  }) as unknown as Request;

describe("GET /api/notifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authGuard as jest.Mock).mockResolvedValue(mockAuth);
  });

  it("should return 401 if not authenticated", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });
    const res = await GET(mockRequest("http://localhost/api/notifications"));
    expect(res.status).toBe(401);
  });

  it("should return all notifications for the user", async () => {
    const notifications = [{ id: 1, read: false }, { id: 2, read: true }];
    (prisma.notification.findMany as jest.Mock).mockResolvedValue(notifications);

    const res = await GET(mockRequest("http://localhost/api/notifications"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 1 } })
    );
  });

  it("should filter by unread when filter=unread", async () => {
    (prisma.notification.findMany as jest.Mock).mockResolvedValue([]);
    const res = await GET(mockRequest("http://localhost/api/notifications?filter=unread"));
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 1, read: false } })
    );
    expect(res.status).toBe(200);
  });

  it("should return 500 on database error", async () => {
    (prisma.notification.findMany as jest.Mock).mockRejectedValue(new Error("DB error"));
    const res = await GET(mockRequest("http://localhost/api/notifications"));
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/notifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authGuard as jest.Mock).mockResolvedValue(mockAuth);
  });

  it("should return 401 if not authenticated", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });
    const res = await PATCH(mockRequest("http://localhost/api/notifications", {}));
    expect(res.status).toBe(401);
  });

  it("should mark all as read when markAllRead is true", async () => {
    (prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 3 });
    const res = await PATCH(mockRequest("http://localhost/api/notifications", { markAllRead: true }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Todas marcadas como leídas");
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 1, read: false },
      data: { read: true },
    });
  });

  it("should return 400 if neither notificationId nor markAllRead is provided", async () => {
    const res = await PATCH(mockRequest("http://localhost/api/notifications", {}));
    expect(res.status).toBe(400);
  });

  it("should return 404 if notification not found", async () => {
    (prisma.notification.findFirst as jest.Mock).mockResolvedValue(null);
    const res = await PATCH(
      mockRequest("http://localhost/api/notifications", { notificationId: 99 })
    );
    expect(res.status).toBe(404);
  });

  it("should mark a single notification as read", async () => {
    (prisma.notification.findFirst as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.notification.update as jest.Mock).mockResolvedValue({ id: 1, read: true });

    const res = await PATCH(
      mockRequest("http://localhost/api/notifications", { notificationId: 1 })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Marcada como leída");
  });

  it("should return 500 on database error", async () => {
    (prisma.notification.findFirst as jest.Mock).mockRejectedValue(new Error("DB error"));
    const res = await PATCH(
      mockRequest("http://localhost/api/notifications", { notificationId: 1 })
    );
    expect(res.status).toBe(500);
  });
});
