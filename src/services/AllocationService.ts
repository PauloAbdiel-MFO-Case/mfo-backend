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

async function updateRecord(
  id: number,
  data: { value?: number; date?: Date },
) {
  const updatedRecord = await AllocationRepository.updateRecord(id, data);
  return updatedRecord;
}

async function deleteRecord(id: number) {
  await AllocationRepository.deleteRecord(id);
}

export const AllocationService = {
  create,
  addRecord,
  updateRecord,
  deleteRecord
};