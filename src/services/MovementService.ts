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

export const MovementService = {
  create,
};