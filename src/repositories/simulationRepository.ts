
import { DetailedSimulationVersion, SimulationUpdateData } from 'src/types/simulation.types';
import { prisma } from '../prisma/client';
import { Prisma } from '@prisma/client';

async function findVersionByIdWithDetails(id: number) {
  const simulationVersion = await prisma.simulationVersion.findUniqueOrThrow({
    where: { id },
    include: {
      movements: true,
      allocationRecords: {
        include: {
          allocation: true,
        },
      },
      insurances: true,
    },
  });
  return simulationVersion;
}

async function findAllLatestVersions() {
  const latestVersions = await prisma.simulationVersion.findMany({
    where: {
      isLatest: true,
    },
    include: {
      simulation: true,
      allocationRecords: {
        include: {
          allocation: true,
        },
      },
    },
  });
  return latestVersions;
}

async function deleteVersionById(id: number) {
  const versionToDelete = await prisma.simulationVersion.findUnique({
    where: { id },
    include: { simulation: true },
  });

  if (versionToDelete?.simulation.name === 'Situação Atual') {
    throw new Error('Cannot delete the "Situação Atual" simulation.');
  }
  await prisma.simulationVersion.delete({
    where: {
      id: id,
    },
  });
}

async function findByName(name: string) {
  const simulation = await prisma.simulation.findUnique({
    where: { name },
  });
  return simulation;
}

async function findVersionById(id: number) {
  return SimulationRepository.findVersionByIdWithDetails(id);
}

async function createFromVersion(
  sourceVersion: DetailedSimulationVersion,
  newName: string,
) {
  const newSimulation = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const createdSim = await tx.simulation.create({
      data: {
        name: newName,
        versions: {
          create: {
            version: 1,
            isLatest: true,
            startDate: sourceVersion.startDate,
            realInterestRate: sourceVersion.realInterestRate,
            movements: {
              create: sourceVersion.movements.map((m: any) => ({ 
                type: m.type,
                description: m.description,
                value: m.value,
                frequency: m.frequency,
                startDate: m.startDate,
                endDate: m.endDate,
              })),
            },
            allocationRecords: {
              create: sourceVersion.allocationRecords.map((ar: any) => ({ 
                allocationId: ar.allocationId,
                value: ar.value,
                date: ar.date,
                initialPayment: ar.initialPayment,
                installments: ar.installments,
                interestRate: ar.interestRate,
              })),
            },
            insurances: {
              create: sourceVersion.insurances.map((i: any) => ({ 
                name: i.name,
                startDate: i.startDate,
                durationMonths: i.durationMonths,
                monthlyPremium: i.monthlyPremium,
                insuredValue: i.insuredValue,
              })),
            },
          },
        },
      },
      include: {
        versions: true,
      },
    });
    return createdSim;
  });

  return newSimulation;
}

async function updateVersion(id: number, data: SimulationUpdateData) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const versionToUpdate = await tx.simulationVersion.findUniqueOrThrow({
      where: { id },
      include: { simulation: true },
    });

    if (versionToUpdate.simulation.name === 'Situação Atual') {
      throw new Error('The name and date of "Situação Atual" cannot be changed.');
    }

    if (data.name && data.name !== versionToUpdate.simulation.name) {
      await tx.simulation.update({
        where: { id: versionToUpdate.simulationId },
        data: { name: data.name },
      });
    }

    const updatedVersion = await tx.simulationVersion.update({
      where: { id },
      data: {
        startDate: data.startDate,
        realInterestRate: data.realInterestRate,
      },
    });

    return updatedVersion;
  });
}

async function createNewVersion(simulationId: number) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Encontra a versão mais recente atual para copiar
    const latestVersion = await tx.simulationVersion.findFirstOrThrow({
      where: {
        simulationId: simulationId,
        isLatest: true,
      },
      include: {
        movements: true,
        allocationRecords: true,
        insurances: true,
      },
    });

    // 2. Desmarca a versão antiga como a mais recente
    await tx.simulationVersion.update({
      where: {
        id: latestVersion.id,
      },
      data: {
        isLatest: false,
      },
    });

    // 3. Cria a nova versão, copiando os dados e incrementando a versão
    const newVersion = await tx.simulationVersion.create({
      data: {
        simulationId: simulationId,
        version: latestVersion.version + 1,
        isLatest: true,
        startDate: latestVersion.startDate,
        realInterestRate: latestVersion.realInterestRate,
        movements: {
          create: latestVersion.movements.map((m: any) => ({
            type: m.type,
            description: m.description,
            value: m.value,
            frequency: m.frequency,
            startDate: m.startDate,
            endDate: m.endDate,
          })),
        },
        allocationRecords: {
          create: latestVersion.allocationRecords.map((ar: any) => ({
            allocationId: ar.allocationId,
            value: ar.value,
            date: ar.date,
            initialPayment: ar.initialPayment,
            installments: ar.installments,
            interestRate: ar.interestRate,
          })),
        },
        insurances: {
          create: latestVersion.insurances.map((i: any) => ({
            name: i.name,
            startDate: i.startDate,
            durationMonths: i.durationMonths,
            monthlyPremium: i.monthlyPremium,
            insuredValue: i.insuredValue,
          })),
        },
      },
    });

    return newVersion;
  });
}


export const SimulationRepository = {
  findVersionByIdWithDetails,
  findAllLatestVersions,
  deleteVersionById,
  findByName,
  createFromVersion,
  updateVersion,
  createNewVersion,
  findVersionById
};