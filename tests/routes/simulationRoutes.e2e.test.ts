import request from 'supertest';
import { buildApp } from '../../src/server';
import { FastifyInstance } from 'fastify';
import { SimulationService } from '../../src/services/SimulationService';
import { ProjectionService } from '@/services/ProjectionService';

jest.mock('@/services/SimulationService');
jest.mock('@/services/ProjectionService');

describe('Simulation Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /simulations', () => {
    it('should create a new simulation and return 201', async () => {
      const simulationData = { sourceVersionId: 1, newName: 'New Sim' };
      const createdSimulation = { id: 1, name: 'New Sim' };

      (SimulationService.createFromVersion as jest.Mock).mockResolvedValue(createdSimulation);

      const response = await request(app.server)
        .post('/simulations')
        .send(simulationData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdSimulation);
    });
  });

  describe('GET /simulations', () => {
    it('should return a list of simulations', async () => {
      const simulations = [{ id: 1, name: 'Sim 1' }];
      (SimulationService.listAll as jest.Mock).mockResolvedValue(simulations);

      const response = await request(app.server).get('/simulations');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(simulations);
    });
  });

  describe('PUT /simulations/versions/:versionId', () => {
    it('should update a simulation version and return 200', async () => {
      const versionId = 1;
      const updateData = { name: 'Updated Sim' };
      const updatedSimulation = { id: versionId, ...updateData };

      (SimulationService.update as jest.Mock).mockResolvedValue(updatedSimulation as any);

      const response = await request(app.server)
        .put(`/simulations/versions/${versionId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedSimulation);
    });
  });

  describe('DELETE /simulations/versions/:id', () => {
    it('should delete a simulation version and return 204', async () => {
      const id = 1;
      (SimulationService.deleteById as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app.server).delete(`/simulations/versions/${id}`);

      expect(response.status).toBe(204);
    });
  });

  describe('POST /simulations/:simulationId/versions', () => {
    it('should create a new version and return 201', async () => {
      const simulationId = 1;
      const newVersion = { id: 2, version: 2 };
      (SimulationService.createNewVersion as jest.Mock).mockResolvedValue(newVersion as any);

      const response = await request(app.server).post(`/simulations/${simulationId}/versions`);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(newVersion);
    });
  });

  describe('GET /simulations/versions/:versionId', () => {
    it('should return a simulation version by id', async () => {
      const versionId = 1;
      const simulationVersion = { id: versionId, name: 'Sim 1' };
      (SimulationService.findVersionById as jest.Mock).mockResolvedValue(simulationVersion as any);

      const response = await request(app.server).get(`/simulations/versions/${versionId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(simulationVersion);
    });
  });

   describe('GET /simulations/:id/projection', () => {
    it('should return the projection for a simulation version', async () => {
      const id = 1;
      const status = 'Invalido';
      const projectionData = { withInsurance: [{ year: 2023, value: 1000 }] };

      (ProjectionService.execute as jest.Mock).mockResolvedValue(projectionData as any);

      const response = await request(app.server).get(`/simulations/${id}/projection?status=${status}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(projectionData);
    });
  });
});