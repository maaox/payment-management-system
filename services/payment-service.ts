import { prisma } from "../lib/prisma";

export interface CreatePaymentDTO {
  clientId: string;
  category: string;
  item: string;
  amount: number;
  imageBase64?: string;
}

export interface UpdatePaymentDTO {
  category?: string;
  item?: string;
  amount?: number;
  imageBase64?: string | null; // null para eliminar
}

export async function getPayments(clientId: string | null) {
  // 1) Filtrar por clientId
  const where = clientId ? { clientId } : {};
  return prisma.payment.findMany({ where, orderBy: { createdAt: "desc" } });
}

export async function createPayment(data: CreatePaymentDTO) {
  // 1) Verificar que no exista ya esa combinación
  const exists = await prisma.payment.findFirst({
    where: {
      clientId: data.clientId,
      category: data.category,
      item: data.item,
    },
  });
  if (exists) throw new Error("Pago ya registrado para ese ítem");

  // 2) Crear
  return prisma.payment.create({
    data: {
      clientId: data.clientId,
      category: data.category,
      item: data.item,
      amount: data.amount.toString(),
      image: data.imageBase64
        ? new Uint8Array(Buffer.from(data.imageBase64, "base64"))
        : undefined,
    },
  });
}

export async function updatePayment(id: string, data: UpdatePaymentDTO) {
  // 1) Verificar existencia
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw new Error("Pago no encontrado");

  // 2) Armar payload dinámico
  const updateData: any = {};
  if (data.category) updateData.category = data.category;
  if (data.item) updateData.item = data.item;
  if (typeof data.amount === "number")
    updateData.amount = data.amount.toString();
  if ("imageBase64" in data) {
    updateData.image = data.imageBase64
      ? Buffer.from(data.imageBase64, "base64")
      : null;
  }

  // 3) Actualizar
  return prisma.payment.update({
    where: { id },
    data: updateData,
  });
}

export async function deletePayment(id: string) {
  // 1) Verificar
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw new Error("Pago no encontrado");
  // 2) Eliminar
  return prisma.payment.delete({ where: { id } });
}
