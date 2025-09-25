import { DetailedSimulationVersion } from 'src/types/projection.types';
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
              create: sourceVersion.movements.map((m) => ({ 
                type: m.type,
                description: m.description,
                value: m.value,
                frequency: m.frequency,
                startDate: m.startDate,
                endDate: m.endDate,
              })),
            },
            allocationRecords: {
              create: sourceVersion.allocationRecords.map((ar) => ({ 
                allocationId: ar.allocationId,
                value: ar.value,
                date: ar.date,
                initialPayment: ar.initialPayment,
                installments: ar.installments,
                interestRate: ar.interestRate,
              })),
            },
            insurances: {
              create: sourceVersion.insurances.map((i) => ({ 
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


export const SimulationRepository = {
  findVersionByIdWithDetails,
  findAllLatestVersions,
  deleteVersionById,
  findByName,
  createFromVersion
};