import { prisma } from '../prisma/client';
import { Prisma } from '@prisma/client';

async function create(data: Prisma.MovementUncheckedCreateInput) {
  const movement = await prisma.movement.create({
    data,
  });
  return movement;
}

export const MovementRepository = {
  create,
};