import { GET, PUT } from "../route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: "valid-token" })),
  })),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(() => ({ id: "1" })),
}));

jest.mock("@/lib/config", () => ({
  config: { jwt: { secret: "test-secret" } },
}));

const mockUser = {
  id: 1,
  email: "user@test.com",
  firstName: "Juan",
  lastName: "Pérez",
  dni: "12345678A",
  avatarId: "avatar1",
  role: "STUDENT",
};

describe("GET /api/user/profile", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 401 if no token", async () => {
    const { cookies } = require("next/headers");
    cookies.mockReturnValue({ get: jest.fn(() => undefined) });

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("should return the user profile", async () => {
    const { cookies } = require("next/headers");
    cookies.mockReturnValue({ get: jest.fn(() => ({ value: "valid-token" })) });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.user.email).toBe("user@test.com");
  });

  it("should return 404 if user not found", async () => {
    const { cookies } = require("next/headers");
    cookies.mockReturnValue({ get: jest.fn(() => ({ value: "valid-token" })) });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(404);
  });

  it("should return 500 on unexpected error", async () => {
    const { cookies } = require("next/headers");
    cookies.mockReturnValue({ get: jest.fn(() => ({ value: "valid-token" })) });
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe("PUT /api/user/profile", () => {
  const mockPut = (body: object): Request =>
    ({ json: async () => body }) as unknown as Request;

  beforeEach(() => {
    jest.clearAllMocks();
    const { cookies } = require("next/headers");
    cookies.mockReturnValue({ get: jest.fn(() => ({ value: "valid-token" })) });
  });

  it("should return 401 if no token", async () => {
    const { cookies } = require("next/headers");
    cookies.mockReturnValue({ get: jest.fn(() => undefined) });

    const res = await PUT(mockPut({}));
    expect(res.status).toBe(401);
  });

  it("should return 400 for invalid email format", async () => {
    const res = await PUT(mockPut({ email: "not-an-email" }));
    expect(res.status).toBe(400);
  });

  it("should return 400 if email is already in use", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 99 });
    const res = await PUT(mockPut({ email: "taken@test.com" }));
    expect(res.status).toBe(400);
  });

  it("should update email and avatarId successfully", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.user.update as jest.Mock).mockResolvedValue({
      ...mockUser,
      email: "new@test.com",
      avatarId: "avatar2",
    });

    const res = await PUT(mockPut({ email: "new@test.com", avatarId: "avatar2" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.user.email).toBe("new@test.com");
  });

  it("should update only avatarId when email is not provided", async () => {
    (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, avatarId: "avatar3" });

    const res = await PUT(mockPut({ avatarId: "avatar3" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.user.avatarId).toBe("avatar3");
  });

  it("should return 500 on unexpected error", async () => {
    (prisma.user.update as jest.Mock).mockRejectedValue(new Error("DB error"));
    const res = await PUT(mockPut({ avatarId: "avatar1" }));
    expect(res.status).toBe(500);
  });
});
