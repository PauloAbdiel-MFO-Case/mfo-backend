import { InsuranceRepository } from '@/repositories/insuranceRepository';
import { prismaMock } from '@/tests/singleton';

describe('InsuranceRepository', () => {
  describe('create', () => {
    it('should create a new insurance', async () => {
      const insuranceData = {
        name: 'Test Insurance',
        type: 'LIFE',
        simulationVersionId: 1,
        startDate: new Date(),
        monthlyPremium: 100,
        coverage: 100000,
      };
      const createdInsurance = { id: 1, ...insuranceData };

      prismaMock.insurance.create.mockResolvedValue(createdInsurance as any);

      const result = await InsuranceRepository.create(insuranceData);

      expect(prismaMock.insurance.create).toHaveBeenCalledWith({ data: insuranceData });
      expect(result).toEqual(createdInsurance);
    });
  });

  describe('update', () => {
    it('should update an insurance', async () => {
      const insuranceId = 1;
      const updateData = { name: 'Updated Insurance' };
      const updatedInsurance = { id: insuranceId, name: 'Updated Insurance' };

      prismaMock.insurance.update.mockResolvedValue(updatedInsurance as any);

      const result = await InsuranceRepository.update(insuranceId, updateData);

      expect(prismaMock.insurance.update).toHaveBeenCalledWith({
        where: { id: insuranceId },
        data: updateData,
      });
      expect(result).toEqual(updatedInsurance);
    });
  });

  describe('deleteById', () => {
    it('should delete an insurance', async () => {
      const insuranceId = 1;

      await InsuranceRepository.deleteById(insuranceId);

      expect(prismaMock.insurance.delete).toHaveBeenCalledWith({
        where: { id: insuranceId },
      });
    });
  });

  describe('findByVersionId', () => {
    it('should find insurances by version id', async () => {
      const versionId = 1;
      const insurances = [{ id: 1, simulationVersionId: versionId }];

      prismaMock.insurance.findMany.mockResolvedValue(insurances as any);

      const result = await InsuranceRepository.findByVersionId(versionId);

      expect(prismaMock.insurance.findMany).toHaveBeenCalledWith({
        where: { simulationVersionId: versionId },
      });
      expect(result).toEqual(insurances);
    });
  });

  describe('findAll', () => {
    it('should find all insurances', async () => {
      const insurances = [{ id: 1, name: 'Test Insurance' }];

      prismaMock.insurance.findMany.mockResolvedValue(insurances as any);

      const result = await InsuranceRepository.findAll();

      expect(prismaMock.insurance.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(insurances);
    });
  });
});
