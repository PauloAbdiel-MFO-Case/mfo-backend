import { AllocationRepository } from '@/repositories/allocationRepository';
import { prismaMock } from '@/tests/singleton';
import { Prisma } from '@prisma/client';

describe('AllocationRepository', () => {
  describe('create', () => {
    it('should create a new allocation and an allocation record within a transaction', async () => {
      const versionId = 1;
      const allocationData = {
        name: 'Test Allocation',
        type: 'FINANCIAL',
        value: 1000,
        date: new Date(),
      };

      const createdAllocation = {
        id: 1,
        name: 'Test Allocation',
        type: 'FINANCIAL',
      };

      const createdRecord = {
        id: 1,
        allocationId: 1,
        simulationVersionId: versionId,
        value: 1000,
        date: allocationData.date,
        initialPayment: null,
        installments: null,
        interestRate: null,
      };

      // Mock the transaction
      prismaMock.$transaction.mockImplementation(async (callback) => {
        // Mock the create calls within the transaction
        prismaMock.allocation.create.mockResolvedValue(createdAllocation as any);
        prismaMock.allocationRecord.create.mockResolvedValue(createdRecord as any);

        // Execute the callback with the mocked prisma client
        return await callback(prismaMock as any);
      });

      const result = await AllocationRepository.create(versionId, allocationData);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.allocation.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Allocation',
          type: 'FINANCIAL',
        },
      });
      expect(prismaMock.allocationRecord.create).toHaveBeenCalledWith({
        data: {
          allocationId: 1,
          simulationVersionId: versionId,
          value: 1000,
          date: allocationData.date,
        },
      });
      expect(result).toEqual(createdAllocation);
    });
  });

  describe('update', () => {
    it('should update an allocation', async () => {
      const allocationId = 1;
      const updateData = { name: 'Updated Allocation' };

      const updatedAllocation = {
        id: allocationId,
        name: 'Updated Allocation',
        type: 'FINANCIAL',
      };

      prismaMock.allocation.update.mockResolvedValue(updatedAllocation as any);

      const result = await AllocationRepository.update(allocationId, updateData);

      expect(prismaMock.allocation.update).toHaveBeenCalledWith({
        where: { id: allocationId },
        data: updateData,
      });
      expect(result).toEqual(updatedAllocation);
    });
  });

  describe('deleteById', () => {
    it('should delete an allocation', async () => {
      const allocationId = 1;

      await AllocationRepository.deleteById(allocationId);

      expect(prismaMock.allocation.delete).toHaveBeenCalledWith({
        where: { id: allocationId },
      });
    });
  });

  describe('addRecord', () => {
    it('should add a new record to an allocation', async () => {
      const recordData = {
        allocationId: 1,
        simulationVersionId: 1,
        value: 2000,
        date: new Date(),
      };

      const createdRecord = {
        id: 2,
        ...recordData,
        initialPayment: null,
        installments: null,
        interestRate: null,
      };

      prismaMock.allocationRecord.create.mockResolvedValue(createdRecord as any);

      const result = await AllocationRepository.addRecord(recordData);

      expect(prismaMock.allocationRecord.create).toHaveBeenCalledWith({
        data: recordData,
      });
      expect(result).toEqual(createdRecord);
    });
  });

  describe('updateRecord', () => {
    it('should update an allocation record', async () => {
      const recordId = 1;
      const updateData = { value: 1500 };

      const updatedRecord = {
        id: recordId,
        allocationId: 1,
        simulationVersionId: 1,
        value: 1500,
        date: new Date(),
        initialPayment: null,
        installments: null,
        interestRate: null,
      };

      prismaMock.allocationRecord.update.mockResolvedValue(updatedRecord as any);

      const result = await AllocationRepository.updateRecord(recordId, updateData);

      expect(prismaMock.allocationRecord.update).toHaveBeenCalledWith({
        where: { id: recordId },
        data: updateData,
      });
      expect(result).toEqual(updatedRecord);
    });
  });

  describe('deleteRecord', () => {
    it('should delete an allocation record', async () => {
      const recordId = 1;

      await AllocationRepository.deleteRecord(recordId);

      expect(prismaMock.allocationRecord.delete).toHaveBeenCalledWith({
        where: { id: recordId },
      });
    });
  });

  describe('findByVersionId', () => {
    it('should find allocation records by version id', async () => {
      const versionId = 1;
      const records = [
        {
          id: 1,
          allocationId: 1,
          simulationVersionId: versionId,
          value: 1000,
          date: new Date(),
          allocation: { id: 1, name: 'Test Allocation', type: 'FINANCIAL' },
        },
      ];

      prismaMock.allocationRecord.findMany.mockResolvedValue(records as any);

      const result = await AllocationRepository.findByVersionId(versionId);

      expect(prismaMock.allocationRecord.findMany).toHaveBeenCalledWith({
        where: { simulationVersionId: versionId },
        include: { allocation: true },
      });
      expect(result).toEqual(records);
    });
  });

  describe('findAll', () => {
    it('should find all allocations with their records', async () => {
      const allocations = [
        {
          id: 1,
          name: 'Test Allocation',
          type: 'FINANCIAL',
          records: [
            {
              id: 1,
              allocationId: 1,
              simulationVersionId: 1,
              value: 1000,
              date: new Date(),
            },
          ],
        },
      ];

      prismaMock.allocation.findMany.mockResolvedValue(allocations as any);

      const result = await AllocationRepository.findAll();

      expect(prismaMock.allocation.findMany).toHaveBeenCalledWith({
        include: { records: true },
      });
      expect(result).toEqual(allocations);
    });
  });
});
