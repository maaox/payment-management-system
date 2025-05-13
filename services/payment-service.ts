import { prisma } from "../lib/prisma";

export interface CreatePaymentDTO {
  clientId: string;
  category: string;
  concept: string;
  amount: number;
  image?: string;
  imageType?: string; // Nuevo campo
}

export interface UpdatePaymentDTO {
  category?: string;
  concept?: string;
  amount?: number;
  image?: string | null;
  imageType?: string | null; // Nuevo campo
}

// Utilidad para convertir Uint8Array a base64
function uint8ArrayToBase64(buffer?: Uint8Array | null): string | null {
  if (!buffer) return null;
  return Buffer.from(buffer).toString("base64");
}

// Utilidad para convertir base64 a Uint8Array
function base64ToUint8Array(base64?: string | null): Uint8Array | null {
  if (!base64) return null;
  return new Uint8Array(Buffer.from(base64, "base64"));
}

// Modifica getPayments para devolver la imagen en base64
export async function getPayments(clientId: string | null) {
  const where = clientId ? { clientId } : {};
  const payments = await prisma.payment.findMany({ where, orderBy: { createdAt: "desc" } });
  // Serializar imagen a base64
  return payments.map((p) => ({
    ...p,
    image: uint8ArrayToBase64(p.image),
  }));
}

// Modifica createPayment y updatePayment para aceptar base64 y guardar como Uint8Array
export async function createPayment(data: CreatePaymentDTO) {
  // 1) Verificar que no exista ya esa combinación
  const exists = await prisma.payment.findFirst({
    where: {
      clientId: data.clientId,
      category: data.category,
      concept: data.concept,
    },
  });
  if (exists) throw new Error("Pago ya registrado para ese ítem");

  console.log({image: data.image});
  // 2) Crear el pago
  const payment = await prisma.payment.create({
    data: {
      clientId: data.clientId,
      category: data.category,
      concept: data.concept,
      amount: data.amount.toString(),
      image: base64ToUint8Array(data.image),
      imageType: data.imageType || null, // Guardar tipo MIME
    },
  });

  // 3) Actualizar el totalPaid del cliente
  await updateClientTotalPaid(data.clientId);

  return payment;
}

export async function updatePayment(id: string, data: UpdatePaymentDTO) {
  // 1) Verificar existencia
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw new Error("Pago no encontrado");

  // 2) Armar payload dinámico
  const updateData: any = {};
  if (data.category) updateData.category = data.category;
  if (data.concept) updateData.concept = data.concept;
  if (typeof data.amount === "number")
    updateData.amount = data.amount.toString();
  if (data.image !== undefined) {
    updateData.image = base64ToUint8Array(data.image);
  }
  if (data.imageType !== undefined) {
    updateData.imageType = data.imageType;
  }

  console.log({image: data.image});

  // 3) Actualizar el pago
  const updatedPayment = await prisma.payment.update({
    where: { id },
    data: updateData,
  });

  // 4) Actualizar el totalPaid del cliente
  await updateClientTotalPaid(payment.clientId);

  return updatedPayment;
}

export async function deletePayment(id: string) {
  // 1) Verificar
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw new Error("Pago no encontrado");

  // 2) Guardar el clientId antes de eliminar
  const clientId = payment.clientId;

  // 3) Eliminar
  await prisma.payment.delete({ where: { id } });

  // 4) Actualizar el totalPaid del cliente
  await updateClientTotalPaid(clientId);

  return payment;
}

// Función auxiliar para actualizar el totalPaid del cliente
async function updateClientTotalPaid(clientId: string) {
  // 1) Obtener todos los pagos del cliente
  const payments = await prisma.payment.findMany({
    where: { clientId },
    select: { amount: true },
  });

  // 2) Calcular el total
  const totalPaid = payments.reduce(
    (sum, payment) => sum + parseFloat(payment.amount.toString()),
    0
  );

  // 3) Actualizar el cliente
  await prisma.user.update({
    where: { id: clientId },
    data: { totalPaid: totalPaid.toString() },
  });

  return totalPaid;
}
