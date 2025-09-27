import { AllocationCreationData, AllocationRecordCreationData } from 'src/types/allocation.types';
import { AllocationRepository } from '../repositories/allocationRepository';
import { Prisma } from '@prisma/client';

async function create(versionId: number, data: AllocationCreationData) {
  const allocation = await AllocationRepository.create(versionId, data);
  return allocation;
}

async function update(id: number, data: Prisma.AllocationUpdateInput) {
  return AllocationRepository.update(id, data);
}

async function deleteById(id: number) {
  return AllocationRepository.deleteById(id);
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

async function findByVersionId(versionId: number) {
  return AllocationRepository.findByVersionId(versionId);
}

async function findAll(){
  return AllocationRepository.findAll();
}

export const AllocationService = {
  create,
  update,
  deleteById,
  addRecord,
  updateRecord,
  deleteRecord,
  findByVersionId,
  findAll
};