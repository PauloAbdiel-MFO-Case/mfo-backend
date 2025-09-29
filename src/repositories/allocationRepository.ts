import { prisma } from '../prisma/client';
import { Allocation, AllocationRecord, Prisma } from '@prisma/client';

async function create(
  versionId: number,
  data: Omit<Prisma.AllocationCreateInput, 'records'> & {
    value: number;
    date: Date;
    initialPayment?: number;
    installments?: number;
    interestRate?: number;
  },
): Promise<Allocation> {
  const { name, type, value, date, ...financingData } = data;

  return prisma.$transaction(async (tx) => {
    const allocation = await tx.allocation.create({
      data: {
        name,
        type,
      },
    });

    await tx.allocationRecord.create({
      data: {
        allocationId: allocation.id,
        simulationVersionId: versionId,
        value,
        date,
        ...financingData,
      },
    });

    return allocation;
  });
}

async function update(id: number, data: Prisma.AllocationUpdateInput): Promise<Allocation> {
  return prisma.allocation.update({
    where: { id },
    data,
  });
}

async function deleteById(id: number): Promise<Allocation> {
  return prisma.allocation.delete({
    where: { id },
  });
}

async function addRecord(data: Prisma.AllocationRecordUncheckedCreateInput): Promise<AllocationRecord> {
  const record = await prisma.allocationRecord.create({
    data,
  });
  return record;
}

async function updateRecord(id: number, data: Prisma.AllocationRecordUpdateInput): Promise<AllocationRecord> {
  const record = await prisma.allocationRecord.update({
    where: { id },
    data,
  });
  return record;
}

async function deleteRecord(id: number): Promise<void> {
  await prisma.allocationRecord.delete({
    where: { id },
  });
}

async function findByVersionId(versionId: number): Promise<(AllocationRecord & { allocation: Allocation })[]> {
  return prisma.allocationRecord.findMany({
    where: { simulationVersionId: versionId },
    include: { allocation: true },
  });
}

async function findAll(): Promise<(Allocation & { records: AllocationRecord[] })[]> {
  return prisma.allocation.findMany({
    include: { records: true },
  });
}

export const AllocationRepository = {
  create,
  update,
  deleteById,
  addRecord,
  updateRecord,
  deleteRecord,
  findByVersionId,
  findAll,
};
