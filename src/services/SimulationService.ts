import { SimulationUpdateData } from 'src/types/simulation.types';
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

async function update(id: number, data: SimulationUpdateData) {
  return SimulationRepository.updateVersion(id, data);
}

async function listAll() {
  const simulations = await SimulationRepository.findAllLatestVersions();
  return simulations;
}

async function deleteById(id: number) {
  await SimulationRepository.deleteVersionById(id);
}

async function createNewVersion(simulationId: number) {
  return SimulationRepository.createNewVersion(simulationId);
}

async function findVersionById(id: number) {
  const version = await SimulationRepository.findVersionById(id);
  if (!version) {
    throw new Error('Simulation version not found.');
  }
  return version;
}

async function listAllWithVersions() {
  return SimulationRepository.findAllWithVersions();
}

export const SimulationService = {
  listAll,
  deleteById,
  createFromVersion,
  update,
  createNewVersion,
  findVersionById,
  listAllWithVersions,
};