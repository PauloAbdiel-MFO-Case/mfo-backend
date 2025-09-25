import { AllocationCreationData, AllocationRecordCreationData } from 'src/types/allocation.types';
import { AllocationRepository } from '../repositories/allocationRepository';

async function create(versionId: number, data: AllocationCreationData) {
  const allocation = await AllocationRepository.create(versionId, data);
  return allocation;
}

async function addRecord(
  allocationId: number,
  data: AllocationRecordCreationData,
) {
  const recordData = {
    ...data,
    allocationId,
  };
  const newRecord = await AllocationRepository.addRecord(recordData);
  return newRecord;
}

export const AllocationService = {
  create,
  addRecord
};