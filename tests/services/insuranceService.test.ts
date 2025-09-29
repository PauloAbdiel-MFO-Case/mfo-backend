import { InsuranceService } from '@/services/InsuranceService';
import { InsuranceRepository } from '@/repositories/insuranceRepository';

jest.mock('@/repositories/insuranceRepository');

describe('InsuranceService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call InsuranceRepository.create with the correct data', async () => {
      const versionId = 1;
      const data = {
        name: 'Test Insurance',
        type: 'LIFE',
        startDate: new Date(),
        monthlyPremium: 100,
        coverage: 100000,
      };
      
      await InsuranceService.create(versionId, data);

      expect(InsuranceRepository.create).toHaveBeenCalledWith({ ...data, simulationVersionId: versionId });
    });
  });

  describe('update', () => {
    it('should call InsuranceRepository.update with the correct data', async () => {
      const id = 1;
      const data = { name: 'Updated' };
      await InsuranceService.update(id, data);
      expect(InsuranceRepository.update).toHaveBeenCalledWith(id, data);
    });
  });

  describe('deleteById', () => {
    it('should call InsuranceRepository.deleteById with the correct id', async () => {
      const id = 1;
      await InsuranceService.deleteById(id);
      expect(InsuranceRepository.deleteById).toHaveBeenCalledWith(id);
    });
  });

  describe('findByVersionId', () => {
    it('should call InsuranceRepository.findByVersionId with the correct id', async () => {
      const versionId = 1;
      await InsuranceService.findByVersionId(versionId);
      expect(InsuranceRepository.findByVersionId).toHaveBeenCalledWith(versionId);
    });
  });

  describe('findAll', () => {
    it('should call InsuranceRepository.findAll', async () => {
      await InsuranceService.findAll();
      expect(InsuranceRepository.findAll).toHaveBeenCalled();
    });
  });
});
