// services/userService.ts
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface CreateUserDTO {
  dni: string;
  name: string;
  username: string;
  passwordHash: string;
  role: Role;
  payments?: {
    category: string;
    item: string;
    amount: number;
    imageBase64?: string;
  }[];
}

export interface UpdateUserDTO {
  dni?: string;
  name?: string;
  username?: string;
  passwordHash?: string;
}

export async function getUsers(role: Role = Role.CLIENT) {
  // 1) Filtrar por rol
  return prisma.user.findMany({
    where: { role },
    include: role === Role.CLIENT ? { payments: true } : undefined,
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

  // 2) Validar DNI único dentro de su rol
  const conflictDni = await prisma.user.findFirst({
    where: { dni: data.dni, role: data.role },
  });
  if (conflictDni) {
    throw new Error(`Ya existe un ${data.role} con ese DNI`);
  }

  // 3) Crear usuario + pagos anidados si es CLIENT
  return prisma.user.create({
    data: {
      dni: data.dni,
      name: data.name,
      username: data.username,
      passwordHash: data.passwordHash,
      role: data.role,
      payments:
        data.role === Role.CLIENT && data.payments
          ? {
              create: data.payments.map((p) => ({
                category: p.category,
                item: p.item,
                amount: p.amount.toString(),
                image: p.imageBase64
                  ? new Uint8Array(Buffer.from(p.imageBase64, "base64"))
                  : undefined,
              })),
            }
          : undefined,
    },
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

  // 3) Validar DNI dentro de rol (si cambia)
  if (data.dni && data.dni !== user.dni) {
    const conflict = await prisma.user.findFirst({
      where: { dni: data.dni, role: user.role },
    });
    if (conflict) throw new Error(`Ya existe un ${user.role} con ese DNI`);
  }

  // 4) Actualizar
  return prisma.user.update({
    where: { id },
    data: {
      dni: data.dni,
      name: data.name,
      username: data.username,
      passwordHash: data.passwordHash,
    },
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
