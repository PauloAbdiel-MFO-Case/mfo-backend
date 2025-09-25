import { SimulationRepository } from '../repositories/simulationRepository';

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
};