import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs'
import { Role, Status } from "@prisma/client";

export async function POST(request: Request) {
    try {
        // Recopilación de datos
        const { dni, firstName, lastName, email, dateOfBirth, password, confirmPassword } = await request.json();

        // Validaciones básicas
        if (!email || !password || !dni || !firstName || !lastName || !dateOfBirth) {
            return NextResponse.json({ message: 'Todos los campos son obligatorios'}, { status: 400});
        }
        if (password !== confirmPassword) {
            return NextResponse.json({ message: 'Las contraseñas no coinciden.'}, { status: 400});
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: email }, { dni: dni }], // Estos campos deben ser únicos
            }
        });

        if (existingUser) {
            return NextResponse.json({ message: 'El email o el DNI ya están registrados en la plataforma.'}, { status: 400 });
        }

        // Hasheamos la contraseña antes de almacenarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creamos la solicitud
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                dni,
                firstName,
                lastName,
                dateOfBirth: new Date(dateOfBirth),
                role: Role.STUDENT,
                status: Status.PENDING,
                mustChangePassword: false,
            },
        });

        return NextResponse.json({
            message: 'Socilicitud de registro enviada con éxito. Espera la aprobación del administrador.'
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error: ', error);
        return NextResponse.json({ message: 'Error interno del servidor.'}, { status: 500 });
    }
}