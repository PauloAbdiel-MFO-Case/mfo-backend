import { MovementRepository } from '../repositories/movementRepository';
import { Prisma } from '@prisma/client';

async function create(
  versionId: number,
  data: Omit<Prisma.MovementUncheckedCreateInput, 'simulationVersionId'>,
) {
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
) {
  const movement = await MovementRepository.update(id, data);
  return movement;
}

async function deleteById(id: number) {
  await MovementRepository.deleteById(id);
}

export const MovementService = {
  create,
  update,
  deleteById
};