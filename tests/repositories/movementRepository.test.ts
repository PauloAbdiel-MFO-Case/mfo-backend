import { MovementRepository } from '@/repositories/movementRepository';
import { prismaMock } from '@/tests/singleton';

describe('MovementRepository', () => {
  describe('create', () => {
    it('should create a new movement', async () => {
      const movementData = {
        name: 'Test Movement',
        type: 'INCOME',
        simulationVersionId: 1,
        startDate: new Date(),
        endDate: new Date(),
        value: 1000,
        frequency: 'MONTHLY',
      };
      const createdMovement = { id: 1, ...movementData };

      prismaMock.movement.create.mockResolvedValue(createdMovement as any);

      const result = await MovementRepository.create(movementData);

      expect(prismaMock.movement.create).toHaveBeenCalledWith({ data: movementData });
      expect(result).toEqual(createdMovement);
    });
  });

  describe('update', () => {
    it('should update a movement', async () => {
      const movementId = 1;
      const updateData = { name: 'Updated Movement' };
      const updatedMovement = { id: movementId, name: 'Updated Movement' };

      prismaMock.movement.update.mockResolvedValue(updatedMovement as any);

      const result = await MovementRepository.update(movementId, updateData);

      expect(prismaMock.movement.update).toHaveBeenCalledWith({
        where: { id: movementId },
        data: updateData,
      });
      expect(result).toEqual(updatedMovement);
    });
  });

  describe('deleteById', () => {
    it('should delete a movement', async () => {
      const movementId = 1;

      await MovementRepository.deleteById(movementId);

      expect(prismaMock.movement.delete).toHaveBeenCalledWith({
        where: { id: movementId },
      });
    });
  });

  describe('findByVersionId', () => {
    it('should find movements by version id', async () => {
      const versionId = 1;
      const movements = [{ id: 1, simulationVersionId: versionId }];

      prismaMock.movement.findMany.mockResolvedValue(movements as any);

      const result = await MovementRepository.findByVersionId(versionId);

      expect(prismaMock.movement.findMany).toHaveBeenCalledWith({
        where: { simulationVersionId: versionId },
      });
      expect(result).toEqual(movements);
    });
  });

  describe('findAll', () => {
    it('should find all movements', async () => {
      const movements = [{ id: 1, name: 'Test Movement' }];

      prismaMock.movement.findMany.mockResolvedValue(movements as any);

      const result = await MovementRepository.findAll();

      expect(prismaMock.movement.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(movements);
    });
  });
});
