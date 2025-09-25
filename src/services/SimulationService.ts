import { SimulationRepository } from '../repositories/simulationRepository';

async function createFromVersion(sourceVersionId: number, newName: string ) {
    const existing: boolean = await SimulationRepository.findByName(newName);
    if (existing) {
        throw new Error('A simulation with this name already exists.');
    }

    const sourceVersion = await SimulationRepository.findVersionByIdWithDetails(sourceVersionId);
    if (!sourceVersion) {
        throw new Error('Source simulation version not found.');
    }

    const newSimulation = await SimulationRepository.createFromVersion(sourceVersion, newName);
    return newSimulation;
    
}

async function listAll() {
  const simulations = await SimulationRepository.findAllLatestVersions();
  return simulations;
}

async function deleteById(id: number) {
  await SimulationRepository.deleteVersionById(id);
}

export const SimulationService = {
  listAll,
  deleteById,
  createFromVersion
};