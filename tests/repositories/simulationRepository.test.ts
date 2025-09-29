import { SimulationRepository } from '@/repositories/simulationRepository';
import { prismaMock } from '@/tests/singleton';

describe('SimulationRepository', () => {
  describe('findVersionByIdWithDetails', () => {
    it('should find a simulation version by id with its details', async () => {
      const versionId = 1;
      const simulationVersion = {
        id: versionId,
        movements: [],
        allocationRecords: [],
        insurances: [],
      };

      prismaMock.simulationVersion.findUniqueOrThrow.mockResolvedValue(simulationVersion as any);

      const result = await SimulationRepository.findVersionByIdWithDetails(versionId);

      expect(prismaMock.simulationVersion.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: versionId },
        include: {
          movements: true,
          allocationRecords: {
            include: {
              allocation: true,
            },
          },
          insurances: true,
        },
      });
      expect(result).toEqual(simulationVersion);
    });
  });

  describe('findAllLatestVersions', () => {
    it('should find all latest simulation versions', async () => {
      const latestVersions = [
        {
          id: 1,
          isLatest: true,
          simulation: { id: 1, name: 'Test Sim' },
          allocationRecords: [],
        },
      ];

      prismaMock.simulationVersion.findMany.mockResolvedValue(latestVersions as any);

      const result = await SimulationRepository.findAllLatestVersions();

      expect(prismaMock.simulationVersion.findMany).toHaveBeenCalledWith({
        where: {
          isLatest: true,
        },
        include: {
          simulation: true,
          allocationRecords: {
            include: {
              allocation: true,
            },
          },
        },
      });
      expect(result).toEqual(latestVersions);
    });
  });

  describe('deleteVersionById', () => {
    it('should delete a simulation version', async () => {
      const versionId = 1;
      const versionToDelete = {
        id: versionId,
        simulation: { name: 'Test Sim' },
      };

      prismaMock.simulationVersion.findUnique.mockResolvedValue(versionToDelete as any);

      await SimulationRepository.deleteVersionById(versionId);

      expect(prismaMock.simulationVersion.delete).toHaveBeenCalledWith({
        where: { id: versionId },
      });
    });

    it('should throw an error when trying to delete \'Situação Atual\'', async () => {
      const versionId = 1;
      const versionToDelete = {
        id: versionId,
        simulation: { name: 'Situação Atual' },
      };

      prismaMock.simulationVersion.findUnique.mockResolvedValue(versionToDelete as any);

      await expect(SimulationRepository.deleteVersionById(versionId)).rejects.toThrow(
        'Cannot delete the "Situação Atual" simulation.'
      );
    });
  });

  describe('findByName', () => {
    it('should return true if a simulation with the given name exists', async () => {
      const name = 'Test Sim';
      prismaMock.simulation.findUnique.mockResolvedValue({ id: 1, name } as any);

      const result = await SimulationRepository.findByName(name);

      expect(prismaMock.simulation.findUnique).toHaveBeenCalledWith({ where: { name } });
      expect(result).toBe(true);
    });

    it('should return false if no simulation with the given name exists', async () => {
      const name = 'Non-existent Sim';
      prismaMock.simulation.findUnique.mockResolvedValue(null);

      const result = await SimulationRepository.findByName(name);

      expect(prismaMock.simulation.findUnique).toHaveBeenCalledWith({ where: { name } });
      expect(result).toBe(false);
    });
  });

  describe('findVersionById', () => {
    it('should find a simulation version by id with its details', async () => {
      const versionId = 1;
      const simulationVersion = {
        id: versionId,
        simulation: { id: 1, name: 'Test Sim' },
        movements: [],
        allocationRecords: [],
        insurances: [],
      };

      prismaMock.simulationVersion.findUniqueOrThrow.mockResolvedValue(simulationVersion as any);

      const result = await SimulationRepository.findVersionById(versionId);

      expect(prismaMock.simulationVersion.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: versionId },
        include: {
          simulation: true,
          movements: true,
          allocationRecords: {
            include: {
              allocation: true,
            },
          },
          insurances: true,
        },
      });
      expect(result).toEqual(simulationVersion);
    });
  });

  describe('findAllWithVersions', () => {
    it('should find all simulations with their versions', async () => {
      const simulations = [
        {
          id: 1,
          name: 'Test Sim',
          versions: [{ id: 1, version: 1 }],
        },
      ];

      prismaMock.simulation.findMany.mockResolvedValue(simulations as any);

      const result = await SimulationRepository.findAllWithVersions();

      expect(prismaMock.simulation.findMany).toHaveBeenCalledWith({
        include: {
          versions: {
            orderBy: {
              version: 'asc',
            },
          },
        },
      });
      expect(result).toEqual(simulations);
    });
  });

  describe('createFromVersion', () => {
    it('should create a new simulation from a source version', async () => {
      const sourceVersion = {
        id: 1,
        startDate: new Date(),
        realInterestRate: 0.04,
        movements: [],
        allocationRecords: [],
        insurances: [],
      };
      const newName = 'New Sim';
      const createdSim = { id: 2, name: newName, versions: [{ id: 2, version: 1 }] };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        prismaMock.simulation.create.mockResolvedValue(createdSim as any);
        return await callback(prismaMock as any);
      });

      const result = await SimulationRepository.createFromVersion(sourceVersion as any, newName);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.simulation.create).toHaveBeenCalledWith({
        data: {
          name: newName,
          versions: {
            create: {
              version: 1,
              isLatest: true,
              startDate: sourceVersion.startDate,
              realInterestRate: sourceVersion.realInterestRate,
              movements: { create: [] },
              allocationRecords: { create: [] },
              insurances: { create: [] },
            },
          },
        },
        include: {
          versions: true,
        },
      });
      expect(result).toEqual(createdSim);
    });
  });

  describe('updateVersion', () => {
    it('should update a simulation version', async () => {
      const versionId = 1;
      const updateData = { name: 'Updated Sim', startDate: new Date() };
      const versionToUpdate = {
        id: versionId,
        simulationId: 1,
        simulation: { id: 1, name: 'Test Sim' },
      };
      const updatedVersion = { id: versionId, ...updateData };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        prismaMock.simulationVersion.findUniqueOrThrow.mockResolvedValue(versionToUpdate as any);
        prismaMock.simulation.update.mockResolvedValue({} as any);
        prismaMock.simulationVersion.update.mockResolvedValue(updatedVersion as any);
        return await callback(prismaMock as any);
      });

      const result = await SimulationRepository.updateVersion(versionId, updateData);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.simulation.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Sim' },
      });
      expect(prismaMock.simulationVersion.update).toHaveBeenCalledWith({
        where: { id: versionId },
        data: { startDate: updateData.startDate, realInterestRate: undefined },
      });
      expect(result).toEqual(updatedVersion);
    });

    it('should throw an error when trying to update \'Situação Atual\'', async () => {
      const versionId = 1;
      const updateData = { name: 'Updated Sim' };
      const versionToUpdate = {
        id: versionId,
        simulation: { name: 'Situação Atual' },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        prismaMock.simulationVersion.findUniqueOrThrow.mockResolvedValue(versionToUpdate as any);
        return await callback(prismaMock as any);
      });

      await expect(SimulationRepository.updateVersion(versionId, updateData)).rejects.toThrow(
        'The name and date of "Situação Atual" cannot be changed.'
      );
    });
  });

  describe('createNewVersion', () => {
    it('should create a new version of a simulation', async () => {
      const simulationId = 1;
      const latestVersion = {
        id: 1,
        version: 1,
        isLatest: true,
        startDate: new Date(),
        realInterestRate: 0.04,
        movements: [],
        allocationRecords: [],
        insurances: [],
      };
      const newVersion = { id: 2, version: 2, isLatest: true };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        prismaMock.simulationVersion.findFirstOrThrow.mockResolvedValue(latestVersion as any);
        prismaMock.simulationVersion.update.mockResolvedValue({} as any);
        prismaMock.simulationVersion.create.mockResolvedValue(newVersion as any);
        return await callback(prismaMock as any);
      });

      const result = await SimulationRepository.createNewVersion(simulationId);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.simulationVersion.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          simulationId: simulationId,
          isLatest: true,
        },
        include: {
          movements: true,
          allocationRecords: true,
          insurances: true,
        },
      });
      expect(prismaMock.simulationVersion.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isLatest: false },
      });
      expect(prismaMock.simulationVersion.create).toHaveBeenCalledWith({
        data: {
          simulationId: simulationId,
          version: 2,
          isLatest: true,
          startDate: latestVersion.startDate,
          realInterestRate: latestVersion.realInterestRate,
          movements: { create: [] },
          allocationRecords: { create: [] },
          insurances: { create: [] },
        },
      });
      expect(result).toEqual(newVersion);
    });
  });
});
