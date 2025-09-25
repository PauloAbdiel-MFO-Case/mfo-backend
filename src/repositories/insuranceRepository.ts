import { prisma } from '../prisma/client';
import { Prisma } from '@prisma/client';

async function create(data: Prisma.InsuranceUncheckedCreateInput) {
  return prisma.insurance.create({ data });
}

async function update(id: number, data: Prisma.InsuranceUpdateInput) {
  return prisma.insurance.update({ where: { id }, data });
}

async function deleteById(id: number) {
  return prisma.insurance.delete({ where: { id } });
}

export const InsuranceRepository = {
  create,
  update,
  deleteById,
};