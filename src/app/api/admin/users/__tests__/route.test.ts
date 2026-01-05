import { GET } from "../route";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

describe("GET /api/admin/users/students", () => {
  const mockStudents = [
    {
      id: 1,
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan@example.com",
      dni: "12345678A",
      createdAt: new Date(),
    },
    {
      id: 2,
      firstName: "Maria",
      lastName: "García",
      email: "maria@example.com",
      dni: "87654321B",
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and the list of approved students", async () => {
    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockStudents);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].firstName).toBe("Juan");
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        role: Role.STUDENT,
        requests: {
          some: { status: "APPROVED" },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        dni: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  });

  it("should return 200 and an empty array if no students match the criteria", async () => {
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("should return 500 if prisma fails to fetch users", async () => {
    (prisma.user.findMany as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Error al obtener usuarios");
  });
});
