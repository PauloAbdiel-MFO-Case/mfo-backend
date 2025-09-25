import { prisma } from '../prisma/client';
import { Prisma } from '@prisma/client';

async function create(
  versionId: number,
  data: Omit<Prisma.AllocationCreateInput, 'records'> & {
    value: number;
    date: Date;
    initialPayment?: number;
    installments?: number;
    interestRate?: number;
  },
) {
  const { name, type, value, date, ...financingData } = data;

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

async function addRecord(data: Prisma.AllocationRecordUncheckedCreateInput) {
  const record = await prisma.allocationRecord.create({
    data,
  });
  return record;
}

async function updateRecord(id: number, data: Prisma.AllocationRecordUpdateInput) {
  const record = await prisma.allocationRecord.update({
    where: { id },
    data,
  });
  return record;
}

async function deleteRecord(id: number) {
  await prisma.allocationRecord.delete({
    where: { id },
  });
}

export const AllocationRepository = {
  create,
  addRecord,
  updateRecord,
  deleteRecord
};