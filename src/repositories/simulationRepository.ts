import { prisma } from '../prisma/client';

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

export const SimulationRepository = {
  findVersionByIdWithDetails,
  findAllLatestVersions,
  deleteVersionById,
  findByName,
};