import { Movement, Prisma } from '@prisma/client';
import { MovementRepository } from '../repositories/movementRepository';

async function create(
  versionId: number,
  data: Omit<Prisma.MovementUncheckedCreateInput, 'simulationVersionId'>,
): Promise<Movement> {
  const movementData = {
    ...data,
    simulationVersionId: versionId, 
  };

  const movement = await MovementRepository.create(movementData);
  return movement;
}

async function update(
  id: number,
  data: Prisma.MovementUpdateInput,
): Promise<Movement> {
  const movement = await MovementRepository.update(id, data);
  return movement;
}

async function deleteById(id: number): Promise<void> {
  await MovementRepository.deleteById(id);
}

async function findByVersionId(versionId: number): Promise<Movement[]> {
  return MovementRepository.findByVersionId(versionId);
}

async function findAll(): Promise<Movement[]> {
  return MovementRepository.findAll();
}

export const MovementService = {
  create,
  update,
  deleteById,
  findByVersionId,
  findAll
};