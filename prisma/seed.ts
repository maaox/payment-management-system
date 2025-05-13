import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Función para generar hash de contraseña usando bcrypt
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('Iniciando carga de datos...');

  // Limpiar datos existentes (opcional)
  await prisma.payment.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('Base de datos limpiada. Insertando nuevos datos...');

  // Crear usuarios administradores
  const admin1 = await prisma.user.create({
    data: {
      code: 'ADM001',
      name: 'Administrador Principal',
      username: 'admin',
      passwordHash: await hashPassword('admin123'),
      role: Role.ADMIN,
    },
  });
  
  console.log(`Administrador creado: ${admin1.name}`);

  // Crear colaboradores
  const collaborator1 = await prisma.user.create({
    data: {
      code: 'COL001',
      name: 'Colaborador Uno',
      username: 'colaborador1',
      passwordHash: await hashPassword('colab123'),
      role: Role.COLLABORATOR,
    },
  });
  
  console.log(`Colaborador creado: ${collaborator1.name}`);

  // Crear clientes con pagos
  const client1 = await prisma.user.create({
    data: {
      code: 'CLI001',
      name: 'Cliente Ejemplo 1',
      username: 'cliente1',
      passwordHash: await hashPassword('cliente123'),
      role: Role.CLIENT,
      totalInvestment: '8000',
      totalPaid: '5000',
      payments: {
        create: [
          {
            category: 'Inversión Inicial',
            concept: 'Depósito Bancario',
            amount: '3000',
          },
          {
            category: 'Inversión Adicional',
            concept: 'Transferencia',
            amount: '2000',
          },
        ],
      },
    },
    include: {
      payments: true,
    },
  });
  
  console.log(`Cliente creado: ${client1.name} con ${client1.payments.length} pagos`);

  const client2 = await prisma.user.create({
    data: {
      code: 'CLI002',
      name: 'Cliente Ejemplo 2',
      username: 'cliente2',
      passwordHash: await hashPassword('cliente456'),
      role: Role.CLIENT,
      totalInvestment: '10000',
      totalPaid: '8000',
      payments: {
        create: [
          {
            category: 'Inversión Inicial',
            concept: 'Efectivo',
            amount: '5000',
          },
          {
            category: 'Inversión Adicional',
            concept: 'Depósito Bancario',
            amount: '3000',
          },
        ],
      },
    },
    include: {
      payments: true,
    },
  });
  
  console.log(`Cliente creado: ${client2.name} con ${client2.payments.length} pagos`);

  // Crear cliente sin pagos iniciales
  const client3 = await prisma.user.create({
    data: {
      code: 'CLI003',
      name: 'Cliente Nuevo',
      username: 'cliente3',
      passwordHash: await hashPassword('cliente789'),
      role: Role.CLIENT,
      totalInvestment: '0',
    },
  });
  
  console.log(`Cliente sin pagos creado: ${client3.name}`);

  // Agregar pagos adicionales para el cliente 1
  const payment1 = await prisma.payment.create({
    data: {
      clientId: client1.id,
      category: 'Mantenimiento',
      concept: 'Cuota Mensual',
      amount: '500',
    },
  });
  
  console.log(`Pago adicional creado para ${client1.name}: ${payment1.category} - ${payment1.concept}`);

  console.log('Carga de datos completada con éxito!');
}

main()
  .catch((e) => {
    console.error('Error durante la carga de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Cerrar la conexión de Prisma al finalizar
    await prisma.$disconnect();
  });