import request from 'supertest';
import { app } from '@/server';
import { SimulationService } from '@/services/SimulationService';
import { ProjectionService } from '@/services/ProjectionService';

jest.mock('@/services/SimulationService');
jest.mock('@/services/ProjectionService');

describe('Simulation Routes', () => {
  afterAll(async () => {
    await app.close();
  });

  describe('POST /simulations', () => {
    it('should create a new simulation from a version and return 201', async () => {
      const simulationData = { sourceVersionId: 1, newName: 'New Sim' };
      const createdSimulation = { id: 1, name: 'New Sim' };

      (SimulationService.createFromVersion as jest.Mock).mockResolvedValue(createdSimulation);

      const response = await request(app.server)
        .post('/simulations')
        .send(simulationData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdSimulation);
    });

    it('should return 409 if simulation name already exists', async () => {
      const simulationData = { sourceVersionId: 1, newName: 'Existing Sim' };

      (SimulationService.createFromVersion as jest.Mock).mockRejectedValue(new Error('A simulation with this name already exists.'));

      const response = await request(app.server)
        .post('/simulations')
        .send(simulationData);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: 'A simulation with this name already exists.' });
    });

    it('should return 404 if source version not found', async () => {
      const simulationData = { sourceVersionId: 999, newName: 'New Sim' };

      (SimulationService.createFromVersion as jest.Mock).mockRejectedValue(new Error('Source simulation version not found.'));

      const response = await request(app.server)
        .post('/simulations')
        .send(simulationData);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Source simulation version not found.' });
    });
  });

  describe('GET /simulations', () => {
    it('should return a list of all latest simulations', async () => {
      const simulations = [{ id: 1, name: 'Sim 1' }];
      (SimulationService.listAll as jest.Mock).mockResolvedValue(simulations);

      const response = await request(app.server).get('/simulations');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(simulations);
    });
  });

  describe('PUT /simulations/:id', () => {
    it('should update a simulation and return 200', async () => {
      const id = 1;
      const updateData = { name: 'Updated Sim' };
      const updatedSimulation = { id: 1, ...updateData };

      (SimulationService.update as jest.Mock).mockResolvedValue(updatedSimulation);

      const response = await request(app.server)
        .put(`/simulations/${id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedSimulation);
    });

    it('should return 400 if trying to update \'Situação Atual\'', async () => {
      const id = 1;
      const updateData = { name: 'Updated Sim' };

      (SimulationService.update as jest.Mock).mockRejectedValue(new Error('The name and date of "Situação Atual" cannot be changed.'));

      const response = await request(app.server)
        .put(`/simulations/${id}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'The name and date of "Situação Atual" cannot be changed.' });
    });
  });

  describe('DELETE /simulations/:id', () => {
    it('should delete a simulation and return 204', async () => {
      const id = 1;

      (SimulationService.deleteById as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app.server).delete(`/simulations/${id}`);

      expect(response.status).toBe(204);
    });

    it('should return 400 if trying to delete \'Situação Atual\'', async () => {
      const id = 1;

      (SimulationService.deleteById as jest.Mock).mockRejectedValue(new Error('Cannot delete the "Situação Atual" simulation.'));

      const response = await request(app.server).delete(`/simulations/${id}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Cannot delete the "Situação Atual" simulation.' });
    });
  });

  describe('POST /simulations/:id/new-version', () => {
    it('should create a new version of a simulation and return 201', async () => {
      const id = 1;
      const newVersion = { id: 2, version: 2 };

      (SimulationService.createNewVersion as jest.Mock).mockResolvedValue(newVersion);

      const response = await request(app.server).post(`/simulations/${id}/new-version`);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(newVersion);
    });
  });

  describe('GET /simulations/:id', () => {
    it('should return a simulation version by id', async () => {
      const id = 1;
      const simulationVersion = { id: 1, name: 'Sim 1' };

      (SimulationService.findVersionById as jest.Mock).mockResolvedValue(simulationVersion);

      const response = await request(app.server).get(`/simulations/${id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(simulationVersion);
    });

    it('should return 404 if simulation version not found', async () => {
      const id = 999;

      (SimulationService.findVersionById as jest.Mock).mockRejectedValue(new Error('Simulation version not found.'));

      const response = await request(app.server).get(`/simulations/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Simulation version not found.' });
    });
  });

  describe('GET /simulations/:id/projection', () => {
    it('should return the projection for a simulation version', async () => {
      const id = 1;
      const status = 'Vivo';
      const projectionData = [{ year: 2023, value: 1000 }];

      (ProjectionService.execute as jest.Mock).mockResolvedValue(projectionData);

      const response = await request(app.server).get(`/simulations/${id}/projection?status=${status}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(projectionData);
    });
  });

  describe('GET /simulations/all-versions', () => {
    it('should return all simulations with their versions', async () => {
      const simulations = [{ id: 1, name: 'Sim 1', versions: [{ id: 1, version: 1 }] }];

      (SimulationService.listAllWithVersions as jest.Mock).mockResolvedValue(simulations);

      const response = await request(app.server).get('/simulations/all-versions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(simulations);
    });
  });
});
