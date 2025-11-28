import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { POST } from "../route";

// Mocks para dependencias
jest.mock('@/lib/prisma', () => ({ 
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
}));

// Mockear JWT para errores de firma
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'mocked_jwt_token'),
}));

describe('POST /api/auth/login', () => {

    const VALID_EMAIL = 'test@example.com';
    const INVALID_EMAIL = 'invalid@example.com';
    const VALID_PASSWORD = 'Password123*';
    const INVALID_PASSWORD = 'WrongPassword';
    const HASHED_PASSWORD = 'hashed_password';

    const mockUser = {
        id: 'user-id-123',
        email: VALID_EMAIL,
        password: HASHED_PASSWORD,
        role: 'STUDENT',
        status: 'ACTIVE',
        firstName: 'Test',
        lastName: 'User',
        mustChangePassword: false,
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- CASOS 401 (Credenciales Inválidas) ---

    it('should return a 401 status for invalid credentials (email not found)', async () => {
        // Simula que el usuario no existe
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        const mockRequest = {
            json: async () => ({
                email: INVALID_EMAIL,
                password: VALID_PASSWORD, 
            }),
        } as unknown as Request;

        const response = await POST(mockRequest);

        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body.message).toBe('Invalid email or password');
        
        expect(bcrypt.compare).not.toHaveBeenCalled();
    })
    
    it('should return a 401 status for invalid credentials (incorrect password)', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        const mockRequest = {
            json: async () => ({
                email: VALID_EMAIL,
                password: INVALID_PASSWORD,
            }),
        } as unknown as Request;

        const response = await POST(mockRequest);

        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body.message).toBe('Invalid email or password');

        expect(bcrypt.compare).toHaveBeenCalledWith(INVALID_PASSWORD, HASHED_PASSWORD);
    })

    // --- CASOS 400 (Faltan Datos) ---

    it('should return a 400 status if email is missing', async () => {
        const mockRequest = {
            json: async () => ({
                email: '',
                password: VALID_PASSWORD,
            }),
        } as unknown as Request;

        const response = await POST(mockRequest);

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.message).toBe('Email and password are required');
    });

    // --- CASOS 403 (Cuenta Inactiva) ---

    it('should return a 403 status for a valid but INACTIVE user (STUDENT)', async () => {
        const mockInactiveStudent = { ...mockUser, status: 'INACTIVE', role: 'STUDENT' };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockInactiveStudent);
        
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const mockRequest = {
            json: async () => ({
                email: mockInactiveStudent.email,
                password: VALID_PASSWORD,
            }),
        } as unknown as Request;

        const response = await POST(mockRequest);
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.message).toBe('Your account is not active. Please contact support.');
        expect(body.status).toBe('INACTIVE');
    });

    it('should return a 403 status for a valid but DESACTIVATED user (ADMIN)', async () => {
        const mockDesactivatedAdmin = { ...mockUser, status: 'INACTIVE', role: 'ADMIN' };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDesactivatedAdmin);
        
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const mockRequest = {
            json: async () => ({
                email: mockDesactivatedAdmin.email,
                password: VALID_PASSWORD,
            }),
        } as unknown as Request;

        const response = await POST(mockRequest);
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.message).toBe('Your admin account is desactivated. Please contact support.');
        expect(body.status).toBe('INACTIVE');
    });

    // --- CASO 200 (Login Exitoso) ---

    it('should return a 200 status and a token for a valid ACTIVE user (ADMIN)', async () => {
        const mockAdminUser = { ...mockUser, role: 'ADMIN', email: 'admin@example.com' };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdminUser);
        
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const mockRequest = {
            json: async () => ({
                email: mockAdminUser.email,
                password: VALID_PASSWORD,
            }),
        } as unknown as Request;

        const response = await POST(mockRequest);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.message).toBe('Login successful');
        expect(body.token).toBe('mocked_jwt_token');
        
        expect(body.user.email).toBe(mockAdminUser.email);
        expect(body.user.role).toBe('ADMIN');
    });
});