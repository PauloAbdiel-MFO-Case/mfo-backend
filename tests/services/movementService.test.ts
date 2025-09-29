import { MovementService } from '@/services/MovementService';
import { MovementRepository } from '@/repositories/movementRepository';

jest.mock('@/repositories/movementRepository');

describe('MovementService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call MovementRepository.create with the correct data', async () => {
      const versionId = 1;
      const data = {
        name: 'Test Movement',
        type: 'INCOME',
        startDate: new Date(),
        endDate: new Date(),
        value: 1000,
        frequency: 'MONTHLY',
      };
      
      await MovementService.create(versionId, data);

      expect(MovementRepository.create).toHaveBeenCalledWith({ ...data, simulationVersionId: versionId });
    });
  });

  describe('update', () => {
    it('should call MovementRepository.update with the correct data', async () => {
      const id = 1;
      const data = { name: 'Updated' };
      await MovementService.update(id, data);
      expect(MovementRepository.update).toHaveBeenCalledWith(id, data);
    });
  });

  describe('deleteById', () => {
    it('should call MovementRepository.deleteById with the correct id', async () => {
      const id = 1;
      await MovementService.deleteById(id);
      expect(MovementRepository.deleteById).toHaveBeenCalledWith(id);
    });
  });

  describe('findByVersionId', () => {
    it('should call MovementRepository.findByVersionId with the correct id', async () => {
      const versionId = 1;
      await MovementService.findByVersionId(versionId);
      expect(MovementRepository.findByVersionId).toHaveBeenCalledWith(versionId);
    });
  });

  describe('findAll', () => {
    it('should call MovementRepository.findAll', async () => {
      await MovementService.findAll();
      expect(MovementRepository.findAll).toHaveBeenCalled();
    });
  });
});
