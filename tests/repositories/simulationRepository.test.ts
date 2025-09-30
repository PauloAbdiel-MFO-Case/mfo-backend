import { SimulationRepository } from '@/repositories/simulationRepository';
import { prismaMock } from '@/tests/singleton';

describe('SimulationRepository', () => {
  describe('findByName', () => {
    it('should return a simulation if found', async () => {
      const name = 'Test Sim';
      const userId = 1;
      const simulation = { id: 1, name, userId };
      prismaMock.simulation.findUnique.mockResolvedValue(simulation as any);

      const result = await SimulationRepository.findByName(name, userId);

      expect(prismaMock.simulation.findUnique).toHaveBeenCalledWith({ where: { userId_name: { userId, name } } });
      expect(result).toEqual(simulation);
    });

    it('should return null if no simulation is found', async () => {
      const name = 'Non-existent Sim';
      const userId = 1;
      prismaMock.simulation.findUnique.mockResolvedValue(null);

      const result = await SimulationRepository.findByName(name, userId);

      expect(result).toBeNull();
    });
  });
});