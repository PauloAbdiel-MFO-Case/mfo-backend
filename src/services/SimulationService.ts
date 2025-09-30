import { Simulation, SimulationVersion } from '@prisma/client';
import { SimulationUpdateData } from '@/types/simulation.types';
import { SimulationRepository } from '@/repositories/simulationRepository';
import { ProjectionService } from './ProjectionService';

type SimulationWithVersions = Simulation & { versions: SimulationVersion[] };
type VersionWithPatrimony = SimulationVersion & { finalPatrimony: number };
type SimulationWithPatrimony = Simulation & { versions: VersionWithPatrimony[] };

async function createFromVersion(sourceVersionId: number, newName: string, userId: number ): Promise<Simulation> {
    const existing = await SimulationRepository.findByName(newName, userId);
    if (existing) {
        throw new Error('A simulation with this name already exists.');
    }

    const sourceVersion = await SimulationRepository.findVersionByIdWithDetails(sourceVersionId);
    if (!sourceVersion) {
        throw new Error('Source simulation version not found.');
    }

    const newSimulation = await SimulationRepository.createFromVersion(sourceVersion, newName, userId);
    return newSimulation;
}

async function update(id: number, data: SimulationUpdateData): Promise<SimulationVersion> {
  return SimulationRepository.updateVersion(id, data);
}

async function listAll(userId: number) {
  return SimulationRepository.findAllLatestVersions(userId);
}

async function deleteById(id: number): Promise<void> {
  await SimulationRepository.deleteVersionById(id);
}

async function createNewVersion(simulationId: number): Promise<SimulationVersion> {
  return SimulationRepository.createNewVersion(simulationId);
}

async function findVersionById(id: number) {
  const version = await SimulationRepository.findVersionById(id);
  if (!version) {
    throw new Error('Simulation version not found.');
  }
  return version;
}

async function listAllWithVersions(userId: number): Promise<SimulationWithPatrimony[]> {
  const simulations = await SimulationRepository.findAllWithVersions(userId);

  if (!simulations || simulations.length === 0) {
    return [];
  }

  const simulationsWithPatrimony = await Promise.all(simulations.map(async (sim: SimulationWithVersions) => {
    const versionsWithPatrimony = await Promise.all(sim.versions.map(async (version: SimulationVersion) => {
      try {
        const projection = await ProjectionService.execute({
          simulationVersionId: version.id,
          status: 'Vivo',
        });
        const finalPatrimony = projection.withInsurance[projection.withInsurance.length - 1]?.totalPatrimony || 0;
        return { ...version, finalPatrimony };
      } catch (error) {
        console.error(`Error calculating patrimony for version ${version.id}:`, error);
        return { ...version, finalPatrimony: 0 };
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