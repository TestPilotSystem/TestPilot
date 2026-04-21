import { GET } from "../route";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/middleware/guards";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    notification: {
      count: jest.fn(),
    },
  },
}));

jest.mock("@/lib/middleware/guards", () => ({
  authGuard: jest.fn(),
}));

const mockRequest = (): Request =>
  ({ url: "http://localhost/api/notifications/unread-count" }) as unknown as Request;

describe("GET /api/notifications/unread-count", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1" } });
  });

  it("should return 401 if not authenticated", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });
    const res = await GET(mockRequest());
    expect(res.status).toBe(401);
  });

  it("should return the count of unread notifications", async () => {
    (prisma.notification.count as jest.Mock).mockResolvedValue(5);
    const res = await GET(mockRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.count).toBe(5);
    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: { userId: 1, read: false },
    });
  });

  it("should return count 0 when all notifications are read", async () => {
    (prisma.notification.count as jest.Mock).mockResolvedValue(0);
    const res = await GET(mockRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.count).toBe(0);
  });

  it("should return 500 on database error", async () => {
    (prisma.notification.count as jest.Mock).mockRejectedValue(new Error("DB error"));
    const res = await GET(mockRequest());
    expect(res.status).toBe(500);
  });
});
