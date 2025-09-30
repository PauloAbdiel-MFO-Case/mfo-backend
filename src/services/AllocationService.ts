import { Allocation, AllocationRecord, Prisma } from '@prisma/client';
import { AllocationCreationData, AllocationRecordCreationData } from '@/types/allocation.types';
import { AllocationRepository } from '../repositories/allocationRepository';

async function create(versionId: number, data: AllocationCreationData): Promise<Allocation> {
  const allocation = await AllocationRepository.create(versionId, data);
  return allocation;
}

async function update(id: number, data: Prisma.AllocationUpdateInput): Promise<Allocation> {
  return AllocationRepository.update(id, data);
}

async function deleteById(id: number): Promise<void> {
  await AllocationRepository.deleteById(id);
}

async function addRecord(
  allocationId: number,
  data: AllocationRecordCreationData,
): Promise<AllocationRecord> {
  const recordData = {
    ...data,
    allocationId,
  };
  const newRecord = await AllocationRepository.addRecord(recordData);
  return newRecord;
}

async function updateRecord(
  id: number,
  data: Prisma.AllocationRecordUpdateInput,
): Promise<AllocationRecord> {
  const updatedRecord = await AllocationRepository.updateRecord(id, data);
  return updatedRecord;
}

async function deleteRecord(id: number): Promise<void> {
  await AllocationRepository.deleteRecord(id);
}

async function findByVersionId(versionId: number): Promise<(AllocationRecord & { allocation: Allocation })[]> {
  return AllocationRepository.findByVersionId(versionId);
}

async function findAll(): Promise<(Allocation & { records: AllocationRecord[] })[]> {
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