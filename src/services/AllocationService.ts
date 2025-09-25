import { AllocationCreationData } from 'src/types/allocation.types';
import { AllocationRepository } from '../repositories/allocationRepository';

async function create(versionId: number, data: AllocationCreationData) {
  const allocation = await AllocationRepository.create(versionId, data);
  return allocation;
}

export const AllocationService = {
  create,
};