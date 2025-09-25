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

export const SimulationRepository = {
  findVersionByIdWithDetails,
};