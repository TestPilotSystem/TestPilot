import { DELETE } from "../route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      delete: jest.fn(),
    },
  },
}));

describe("DELETE /api/admin/users/[id]", () => {
  const USER_ID_STR = "123";
  const USER_ID_NUM = 123;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return 200 when user is deleted successfully", async () => {
    (prisma.user.delete as jest.Mock).mockResolvedValue({ id: USER_ID_NUM });

    const params = Promise.resolve({ id: USER_ID_STR });
    const request = {} as Request;

    const response = await DELETE(request, { params });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Usuario eliminado con éxito");
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: USER_ID_NUM },
    });
  });

  it("should return 400 if the ID is not a valid number", async () => {
    const params = Promise.resolve({ id: "not-a-number" });
    const request = {} as Request;

    const response = await DELETE(request, { params });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("ID de usuario no válido");
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it("should return 500 if prisma fails to delete the user", async () => {
    (prisma.user.delete as jest.Mock).mockRejectedValue(
      new Error("DB Delete Error")
    );

    const params = Promise.resolve({ id: USER_ID_STR });
    const request = {} as Request;

    const response = await DELETE(request, { params });
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe(
      "Error al eliminar el usuario de la base de datos"
    );
  });
});
