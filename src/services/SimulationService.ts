import { SimulationUpdateData } from 'src/types/simulation.types';
import { SimulationRepository } from '../repositories/simulationRepository';
import { ProjectionService } from './ProjectionService';

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
  const simulations = await SimulationRepository.findAllWithVersions();

  const simulationsWithPatrimony = await Promise.all(simulations.map(async (sim: any) => {
    const versionsWithPatrimony = await Promise.all(sim.versions.map(async (version: any) => {
      try {
        const projection = await ProjectionService.execute({
          simulationVersionId: version.id,
          status: 'Vivo', // Assuming 'Vivo' for history display
        });
        const finalPatrimony = projection.withInsurance[projection.withInsurance.length - 1]?.totalPatrimony || 0;
        return { ...version, finalPatrimony };
      } catch (error) {
        console.error(`Error calculating patrimony for version ${version.id}:`, error);
        return { ...version, finalPatrimony: 0 }; // Return with 0 if calculation fails
      }
    }));
    return { ...sim, versions: versionsWithPatrimony };
  }));

  return simulationsWithPatrimony;
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