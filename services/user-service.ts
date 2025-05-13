import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";
import { hashPassword } from "./auth-service";

export interface CreateUserDTO {
  code: string;
  name: string;
  username: string;
  password: string;
  role: Role;
  totalInvestment?: number;
  totalPaid?: number;
  payments?: {
    category: string;
    concept: string;
    amount: number;
    imageBase64?: string;
  }[];
}

export interface UpdateUserDTO {
  code?: string;
  name?: string;
  username?: string;
  password?: string;
  totalInvestment?: number;
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { payments: true }, // Incluir pagos para clientes
  });
  if (!user) throw new Error("Usuario no encontrado");
  return user;
}

export async function getUsers(role: Role = Role.CLIENT) {
  // 1) Filtrar por rol
  return prisma.user.findMany({
    where: { role },
  });
}

export async function createUser(data: CreateUserDTO) {
  // 1) Validar username único
  const existingUser = await prisma.user.findUnique({
    where: { username: data.username },
  });
  if (existingUser) {
    throw new Error("El username ya está en uso");
  }

  // 2) Validar código único dentro de su rol
  const conflictCode = await prisma.user.findFirst({
    where: { code: data.code, role: data.role },
  });
  if (conflictCode) {
    throw new Error(`Ya existe un ${data.role} con ese código`);
  }

  // 3) Hashear la contraseña
  const passwordHash = await hashPassword(data.password);

  // 4) Crear usuario + pagos anidados si es CLIENT
  return prisma.user.create({
    data: {
      code: data.code,
      name: data.name,
      username: data.username,
      passwordHash: passwordHash, // Usar el hash generado
      role: data.role,
      totalInvestment: data?.totalInvestment?.toString(),
      totalPaid: data?.totalPaid?.toString(),
      payments: {
        create: data?.payments?.map((p) => ({
          category: p.category,
          concept: p.concept,
          amount: p.amount.toString(),
          image: p.imageBase64
            ? new Uint8Array(Buffer.from(p.imageBase64, "base64"))
            : undefined,
        })),
      },
    },
    include: { payments: data.role === Role.CLIENT }, // Incluir pagos en la respuesta si es cliente
  });
}

export async function updateUser(id: string, data: UpdateUserDTO) {
  // 1) Verificar existencia
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Usuario no encontrado");

  // 2) Validar username (si cambia)
  if (data.username && data.username !== user.username) {
    const dupe = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (dupe) throw new Error("El username ya está en uso");
  }

  // 3) Validar código dentro de rol (si cambia)
  if (data.code && data.code !== user.code) {
    const conflict = await prisma.user.findFirst({
      where: { code: data.code, role: user.role },
    });
    if (conflict) throw new Error(`Ya existe un ${user.role} con ese código`);
  }

  // 4) Hashear la contraseña si se proporciona una nueva
  let passwordHashToUpdate;
  if (data.password) {
    passwordHashToUpdate = await hashPassword(data.password);
  }

  // 5) Actualizar
  return prisma.user.update({
    where: { id },
    data: {
      code: data.code,
      name: data.name,
      username: data.username,
      passwordHash: passwordHashToUpdate, // Solo actualizar si hay nueva contraseña
      totalInvestment: data?.totalInvestment?.toString()
    },
    include: { payments: user.role === Role.CLIENT }, // Incluir pagos en la respuesta si es cliente
  });
}

export async function deleteUser(id: string) {
  // 1) Buscar usuario
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Usuario no encontrado");

  // 2) Si es CLIENT, eliminar sus pagos
  if (user.role === Role.CLIENT) {
    await prisma.payment.deleteMany({ where: { clientId: id } });
  }

  // 3) Eliminar usuario
  return prisma.user.delete({ where: { id } });
}
