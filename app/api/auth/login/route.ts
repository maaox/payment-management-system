import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as jose from 'jose';
import { comparePasswords } from "@/services/auth-service";

// Obtener la clave secreta de las variables de entorno
const JWT_SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET || "payment-management-system-secret-key";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_KEY);

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Validar que se proporcionaron credenciales
    if (!username || !password) {
      return NextResponse.json(
        { error: "Se requiere nombre de usuario y contraseña" },
        { status: 400 }
      );
    }

    // Buscar usuario por username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    // Verificar si el usuario existe
    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const passwordValid = await comparePasswords(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = await new jose.SignJWT({ id: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Preparar respuesta sin incluir passwordHash
    const userResponse = {
      id: user.id,
      code: user.code,
      name: user.name,
      username: user.username,
      role: user.role,
      totalInvestment: user.totalInvestment,
    };

    return NextResponse.json({
      token,
      user: userResponse
    });
  } catch (error: any) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}