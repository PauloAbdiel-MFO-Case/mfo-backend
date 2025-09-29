'use client';

import { DetailedSimulationVersion, SimulationUpdateData } from 'src/types/simulation.types';
import { prisma } from '../prisma/client';
import { Prisma, Simulation, SimulationVersion } from '@prisma/client';

async function findVersionByIdWithDetails(id: number): Promise<DetailedSimulationVersion> {
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

async function findAllLatestVersions(): Promise<(SimulationVersion & { simulation: Simulation; allocationRecords: (AllocationRecord & { allocation: Allocation })[] })[]> {
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

async function deleteVersionById(id: number): Promise<void> {
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

async function findByName(name: string): Promise<boolean> {
  const simulation = await prisma.simulation.findUnique({
    where: { name },
  });
  return !!simulation;
}

async function findVersionById(id: number): Promise<DetailedSimulationVersion> {
  return prisma.simulationVersion.findUniqueOrThrow({
    where: { id },
    include: {
      simulation: true,
      movements: true,
      allocationRecords: {
        include: {
          allocation: true,
        },
      },
      insurances: true,
    },
  });
}

async function findAllWithVersions(): Promise<(Simulation & { versions: SimulationVersion[] })[]> {
  return prisma.simulation.findMany({
    include: {
      versions: {
        orderBy: {
          version: 'asc',
        },
      },
    },
  });
}

async function createFromVersion(
  sourceVersion: DetailedSimulationVersion,
  newName: string,
): Promise<Simulation & { versions: SimulationVersion[] }> {
  const newSimulation = await prisma.$transaction(async (tx) => {
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

async function updateVersion(id: number, data: SimulationUpdateData): Promise<SimulationVersion> {
  return prisma.$transaction(async (tx) => {
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

async function createNewVersion(simulationId: number): Promise<SimulationVersion> {
  return prisma.$transaction(async (tx) => {
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

    await tx.simulationVersion.update({
      where: {
        id: latestVersion.id,
      },
      data: {
        isLatest: false,
      },
    });

    const newVersion = await tx.simulationVersion.create({
      data: {
        simulationId: simulationId,
        version: latestVersion.version + 1,
        isLatest: true,
        startDate: latestVersion.startDate,
        realInterestRate: latestVersion.realInterestRate,
        movements: {
          create: latestVersion.movements.map((m) => ({
            type: m.type,
            description: m.description,
            value: m.value,
            frequency: m.frequency,
            startDate: m.startDate,
            endDate: m.endDate,
          })),
        },
        allocationRecords: {
          create: latestVersion.allocationRecords.map((ar) => ({
            allocationId: ar.allocationId,
            value: ar.value,
            date: ar.date,
            initialPayment: ar.initialPayment,
            installments: ar.installments,
            interestRate: ar.interestRate,
          })),
        },
        insurances: {
          create: latestVersion.insurances.map((i) => ({
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
  findVersionById,
  findAllWithVersions,
};