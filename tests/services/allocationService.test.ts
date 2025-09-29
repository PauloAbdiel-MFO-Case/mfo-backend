import { AllocationService } from '@/services/AllocationService';
import { AllocationRepository } from '@/repositories/allocationRepository';

jest.mock('@/repositories/allocationRepository');

describe('AllocationService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call AllocationRepository.create with the correct data', async () => {
      const versionId = 1;
      const data = {
        name: 'Test Allocation',
        type: 'FINANCIAL',
        value: 1000,
        date: new Date(),
      };
      const expectedAllocation = { id: 1, ...data };

      (AllocationRepository.create as jest.Mock).mockResolvedValue(expectedAllocation);

      const result = await AllocationService.create(versionId, data);

      expect(AllocationRepository.create).toHaveBeenCalledWith(versionId, data);
      expect(result).toEqual(expectedAllocation);
    });
  });

  describe('update', () => {
    it('should call AllocationRepository.update with the correct data', async () => {
      const id = 1;
      const data = { name: 'Updated' };
      await AllocationService.update(id, data);
      expect(AllocationRepository.update).toHaveBeenCalledWith(id, data);
    });
  });

  describe('deleteById', () => {
    it('should call AllocationRepository.deleteById with the correct id', async () => {
      const id = 1;
      await AllocationService.deleteById(id);
      expect(AllocationRepository.deleteById).toHaveBeenCalledWith(id);
    });
  });

  describe('addRecord', () => {
    it('should call AllocationRepository.addRecord with the correct data', async () => {
      const allocationId = 1;
      const data = { value: 100, date: new Date(), simulationVersionId: 1 };
      await AllocationService.addRecord(allocationId, data);
      expect(AllocationRepository.addRecord).toHaveBeenCalledWith({ ...data, allocationId });
    });
  });

  describe('updateRecord', () => {
    it('should call AllocationRepository.updateRecord with the correct data', async () => {
      const id = 1;
      const data = { value: 200 };
      await AllocationService.updateRecord(id, data);
      expect(AllocationRepository.updateRecord).toHaveBeenCalledWith(id, data);
    });
  });

  describe('deleteRecord', () => {
    it('should call AllocationRepository.deleteRecord with the correct id', async () => {
      const id = 1;
      await AllocationService.deleteRecord(id);
      expect(AllocationRepository.deleteRecord).toHaveBeenCalledWith(id);
    });
  });

  describe('findByVersionId', () => {
    it('should call AllocationRepository.findByVersionId with the correct id', async () => {
      const versionId = 1;
      await AllocationService.findByVersionId(versionId);
      expect(AllocationRepository.findByVersionId).toHaveBeenCalledWith(versionId);
    });
  });

  describe('findAll', () => {
    it('should call AllocationRepository.findAll', async () => {
      await AllocationService.findAll();
      expect(AllocationRepository.findAll).toHaveBeenCalled();
    });
  });
});
