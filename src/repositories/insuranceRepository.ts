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

async function findByVersionId(versionId: number) {
  return prisma.insurance.findMany({
    where: { simulationVersionId: versionId },
  });
}

async function findAll() {
  return prisma.insurance.findMany();
}

export const InsuranceRepository = {
  create,
  update,
  deleteById,
  findAll,
  findByVersionId,
};