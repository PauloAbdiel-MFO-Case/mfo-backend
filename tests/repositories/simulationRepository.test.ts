import { SimulationRepository } from '@/repositories/simulationRepository';
import { prismaMock } from '@/tests/singleton';

describe('SimulationRepository', () => {
  describe('findByName', () => {
    it('should return a simulation if found', async () => {
      const name = 'Test Sim';
      const simulation = { id: 1, name };
      prismaMock.simulation.findUnique.mockResolvedValue(simulation as any);

      const result = await SimulationRepository.findByName(name);

      expect(prismaMock.simulation.findUnique).toHaveBeenCalledWith({ where: { name: name } });
      expect(result).toEqual(simulation);
    });

    it('should return null if no simulation is found', async () => {
      const name = 'Non-existent Sim';
      prismaMock.simulation.findUnique.mockResolvedValue(null);

      const result = await SimulationRepository.findByName(name);

      expect(result).toBeNull();
    });
  });
});