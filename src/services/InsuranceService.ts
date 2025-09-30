import { Insurance, Prisma } from '@prisma/client';
import { InsuranceCreationData } from '@/types/insurance.types';
import { InsuranceRepository } from '../repositories/insuranceRepository';

async function create(versionId: number, data: InsuranceCreationData): Promise<Insurance> {
  return InsuranceRepository.create({ ...data, simulationVersionId: versionId });
}

async function update(id: number, data: Prisma.InsuranceUpdateInput): Promise<Insurance> {
  return InsuranceRepository.update(id, data);
}

async function deleteById(id: number): Promise<void> {
  await InsuranceRepository.deleteById(id);
}

async function findByVersionId(versionId: number): Promise<Insurance[]> {
  return InsuranceRepository.findByVersionId(versionId);
}

async function findAll(): Promise<Insurance[]> {
  return InsuranceRepository.findAll();
}

export const InsuranceService = {
  create,
  update,
  deleteById,
  findByVersionId,
  findAll,
};