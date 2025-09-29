import { prisma } from '../prisma/client';
import { Insurance, Prisma } from '@prisma/client';

async function create(data: Prisma.InsuranceUncheckedCreateInput): Promise<Insurance> {
  return prisma.insurance.create({ data });
}

async function update(id: number, data: Prisma.InsuranceUpdateInput): Promise<Insurance> {
  return prisma.insurance.update({ where: { id }, data });
}

async function deleteById(id: number): Promise<Insurance> {
  return prisma.insurance.delete({ where: { id } });
}

async function findByVersionId(versionId: number): Promise<Insurance[]> {
  return prisma.insurance.findMany({
    where: { simulationVersionId: versionId },
  });
}

async function findAll(): Promise<Insurance[]> {
  return prisma.insurance.findMany();
}

export const InsuranceRepository = {
  create,
  update,
  deleteById,
  findAll,
  findByVersionId,
};