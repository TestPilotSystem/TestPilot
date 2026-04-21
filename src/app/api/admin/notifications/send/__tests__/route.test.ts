import { POST } from "../route";
import { authGuard } from "@/lib/middleware/guards";
import { createNotification } from "@/lib/notifications";

jest.mock("@/lib/middleware/guards", () => ({
  authGuard: jest.fn(),
}));

jest.mock("@/lib/notifications", () => ({
  createNotification: jest.fn(),
}));

const mockRequest = (body: object): Request =>
  ({ json: async () => body }) as unknown as Request;

describe("POST /api/admin/notifications/send", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "10", role: "ADMIN" } });
    (createNotification as jest.Mock).mockResolvedValue(undefined);
  });

  it("should return 401 if not authenticated", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ error: "No autorizado" });
    const res = await POST(mockRequest({ userIds: [1], title: "Hola", messageBody: "Msg" }));
    expect(res.status).toBe(401);
  });

  it("should return 401 if user is not admin", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ payload: { id: "1", role: "STUDENT" } });
    const res = await POST(mockRequest({ userIds: [1], title: "Hola", messageBody: "Msg" }));
    expect(res.status).toBe(401);
  });

  it("should return 400 if userIds is empty", async () => {
    const res = await POST(mockRequest({ userIds: [], title: "Hola", messageBody: "Msg" }));
    expect(res.status).toBe(400);
  });

  it("should return 400 if userIds is not an array", async () => {
    const res = await POST(mockRequest({ userIds: "1", title: "Hola", messageBody: "Msg" }));
    expect(res.status).toBe(400);
  });

  it("should return 400 if title or messageBody is missing", async () => {
    const res = await POST(mockRequest({ userIds: [1], title: "", messageBody: "Msg" }));
    expect(res.status).toBe(400);
  });

  it("should send notifications to all recipients", async () => {
    const res = await POST(
      mockRequest({ userIds: [1, 2, 3], title: "Aviso", messageBody: "Contenido" })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(createNotification).toHaveBeenCalledTimes(3);
    expect(body.sent).toBe(3);
    expect(body.failed).toBe(0);
  });

  it("should report partial failures", async () => {
    (createNotification as jest.Mock)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("fail"));

    const res = await POST(
      mockRequest({ userIds: [1, 2], title: "Aviso", messageBody: "Contenido" })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.sent).toBe(1);
    expect(body.failed).toBe(1);
  });

  it("should return 500 on unexpected error", async () => {
    const badRequest = { json: async () => { throw new Error("parse error"); } } as unknown as Request;
    const res = await POST(badRequest);
    expect(res.status).toBe(500);
  });
});
