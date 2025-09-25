import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  await prisma.simulation.deleteMany();
  await prisma.allocation.deleteMany();

  const originalPlan = await prisma.simulation.create({
    data: {
      name: 'Plano Original',
      versions: {
        create: {
          version: 1,
          startDate: new Date('2025-01-01T00:00:00Z'),
          realInterestRate: 0.04,
        },
      },
    },
    include: {
      versions: true,
    },
  });

  const currentVersion = originalPlan.versions[0];

  const checkingAccount = await prisma.allocation.create({
    data: {
      name: 'Conta Corrente',
      type: 'FINANCEIRA',
    },
  });

  const beachHouse = await prisma.allocation.create({
    data: {
      name: 'Casa de Praia',
      type: 'IMOBILIZADA',
    },
  });

  await prisma.allocationRecord.create({
    data: {
      allocationId: checkingAccount.id,
      simulationVersionId: currentVersion.id,
      value: 75000,
      date: new Date('2025-01-01T00:00:00Z'),
    },
  });

  await prisma.allocationRecord.create({
    data: {
      allocationId: beachHouse.id,
      simulationVersionId: currentVersion.id,
      value: 850000,
      date: new Date('2025-01-01T00:00:00Z'),
    },
  });

  await prisma.movement.create({
    data: {
      simulationVersionId: currentVersion.id,
      type: 'ENTRADA',
      description: 'Salário Mensal',
      value: 22000,
      frequency: 'MENSAL',
      startDate: new Date('2025-01-01T00:00:00Z'),
      endDate: new Date('2055-12-31T00:00:00Z'),
    },
  });

  await prisma.movement.create({
    data: {
      simulationVersionId: currentVersion.id,
      type: 'SAIDA',
      description: 'Custo de Vida Mensal',
      value: 14500,
      frequency: 'MENSAL',
      startDate: new Date('2025-01-01T00:00:00Z'),
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });