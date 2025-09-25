import { prisma } from '../prisma/client';
import { Prisma } from '@prisma/client';

async function create(data: Prisma.MovementUncheckedCreateInput) {
  const movement = await prisma.movement.create({
    data,
  });
  return movement;
}

async function update(id: number, data: Prisma.MovementUpdateInput) {
  const movement = await prisma.movement.update({
    where: { id },
    data,
  });
  return movement;
}

async function deleteById(id: number) {
  await prisma.movement.delete({
    where: { id },
  });
}

export const MovementRepository = {
  create,
  update,
  deleteById
};