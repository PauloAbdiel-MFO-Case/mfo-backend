import { InsuranceCreationData } from 'src/types/insurance.types';
import { InsuranceRepository } from '../repositories/insuranceRepository';
import { Prisma } from '@prisma/client';

async function create(versionId: number, data: InsuranceCreationData) {
  return InsuranceRepository.create({ ...data, simulationVersionId: versionId });
}

async function update(id: number, data: Prisma.InsuranceUpdateInput) {
  return InsuranceRepository.update(id, data);
}

async function deleteById(id: number) {
  return InsuranceRepository.deleteById(id);
}

export const InsuranceService = {
  create,
  update,
  deleteById,
};