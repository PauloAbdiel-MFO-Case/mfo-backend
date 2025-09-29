import { SimulationService } from '@/services/SimulationService';
import { SimulationRepository } from '@/repositories/simulationRepository';

jest.mock('@/repositories/simulationRepository');

describe('SimulationService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFromVersion', () => {
    it('should create a new simulation from a version', async () => {
      const sourceVersionId = 1;
      const newName = 'New Sim';
      const sourceVersion = { id: sourceVersionId };

      (SimulationRepository.findByName as jest.Mock).mockResolvedValue(false);
      (SimulationRepository.findVersionByIdWithDetails as jest.Mock).mockResolvedValue(sourceVersion);

      await SimulationService.createFromVersion(sourceVersionId, newName);

      expect(SimulationRepository.findByName).toHaveBeenCalledWith(newName);
      expect(SimulationRepository.findVersionByIdWithDetails).toHaveBeenCalledWith(sourceVersionId);
      expect(SimulationRepository.createFromVersion).toHaveBeenCalledWith(sourceVersion, newName);
    });

    it('should throw an error if a simulation with the same name already exists', async () => {
      const sourceVersionId = 1;
      const newName = 'Existing Sim';

      (SimulationRepository.findByName as jest.Mock).mockResolvedValue(true);

      await expect(SimulationService.createFromVersion(sourceVersionId, newName)).rejects.toThrow(
        'A simulation with this name already exists.'
      );
    });

    it('should throw an error if the source version is not found', async () => {
      const sourceVersionId = 1;
      const newName = 'New Sim';

      (SimulationRepository.findByName as jest.Mock).mockResolvedValue(false);
      (SimulationRepository.findVersionByIdWithDetails as jest.Mock).mockResolvedValue(null);

      await expect(SimulationService.createFromVersion(sourceVersionId, newName)).rejects.toThrow(
        'Source simulation version not found.'
      );
    });
  });

  describe('update', () => {
    it('should call SimulationRepository.updateVersion with the correct data', async () => {
      const id = 1;
      const data = { name: 'Updated' };
      await SimulationService.update(id, data);
      expect(SimulationRepository.updateVersion).toHaveBeenCalledWith(id, data);
    });
  });

  describe('listAll', () => {
    it('should call SimulationRepository.findAllLatestVersions', async () => {
      await SimulationService.listAll();
      expect(SimulationRepository.findAllLatestVersions).toHaveBeenCalled();
    });
  });

  describe('deleteById', () => {
    it('should call SimulationRepository.deleteVersionById with the correct id', async () => {
      const id = 1;
      await SimulationService.deleteById(id);
      expect(SimulationRepository.deleteVersionById).toHaveBeenCalledWith(id);
    });
  });

  describe('createNewVersion', () => {
    it('should call SimulationRepository.createNewVersion with the correct id', async () => {
      const id = 1;
      await SimulationService.createNewVersion(id);
      expect(SimulationRepository.createNewVersion).toHaveBeenCalledWith(id);
    });
  });

  describe('findVersionById', () => {
    it('should call SimulationRepository.findVersionById with the correct id', async () => {
      const id = 1;
      (SimulationRepository.findVersionById as jest.Mock).mockResolvedValue({ id: 1 });
      await SimulationService.findVersionById(id);
      expect(SimulationRepository.findVersionById).toHaveBeenCalledWith(id);
    });

    it('should throw an error if the version is not found', async () => {
      const id = 1;
      (SimulationRepository.findVersionById as jest.Mock).mockResolvedValue(null);
      await expect(SimulationService.findVersionById(id)).rejects.toThrow(
        'Simulation version not found.'
      );
    });
  });

  describe('listAllWithVersions', () => {
    it('should call SimulationRepository.findAllWithVersions', async () => {
      await SimulationService.listAllWithVersions();
      expect(SimulationRepository.findAllWithVersions).toHaveBeenCalled();
    });
  });
});
