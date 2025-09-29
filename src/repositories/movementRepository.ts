import { prisma } from '../prisma/client';
import { Movement, Prisma } from '@prisma/client';

async function create(data: Prisma.MovementUncheckedCreateInput): Promise<Movement> {
  const movement = await prisma.movement.create({
    data,
  });
  return movement;
}

async function update(id: number, data: Prisma.MovementUpdateInput): Promise<Movement> {
  const movement = await prisma.movement.update({
    where: { id },
    data,
  });
  return movement;
}

async function deleteById(id: number): Promise<void> {
  await prisma.movement.delete({
    where: { id },
  });
}

async function findByVersionId(versionId: number): Promise<Movement[]> {
  return prisma.movement.findMany({
    where: { simulationVersionId: versionId },
  });
}

async function findAll(): Promise<Movement[]> {
  return prisma.movement.findMany(); 
}

export const MovementRepository = {
  create,
  update,
  deleteById,
  findByVersionId,
  findAll
};