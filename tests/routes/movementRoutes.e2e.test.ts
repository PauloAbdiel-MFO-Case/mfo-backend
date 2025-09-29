import request from 'supertest';
import { buildApp } from '@/server';
import { MovementService } from '@/services/MovementService';
import { FastifyInstance } from 'fastify';

jest.mock('@/services/MovementService');

describe('Movement Routes', () => {
  let app: FastifyInstance;

  beforeAll(() => {
    app = buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /versions/:versionId/movements', () => {
    it('should create a movement and return 201', async () => {
      const versionId = 1;
      const movementData = { name: 'Test', type: 'INCOME', value: 1000, frequency: 'MONTHLY', startDate: new Date().toISOString(), endDate: new Date().toISOString() };
      const createdMovement = { id: 1, ...movementData };

      (MovementService.create as jest.Mock).mockResolvedValue(createdMovement);

      const response = await request(app.server)
        .post(`/versions/${versionId}/movements`)
        .send(movementData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdMovement);
    });
  });

  describe('PUT /movements/:movementId', () => {
    it('should update a movement and return 200', async () => {
      const movementId = 1;
      const updateData = { name: 'Updated' };
      const updatedMovement = { id: movementId, ...updateData };

      (MovementService.update as jest.Mock).mockResolvedValue(updatedMovement);

      const response = await request(app.server)
        .put(`/movements/${movementId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedMovement);
    });
  });

  describe('DELETE /movements/:movementId', () => {
    it('should delete a movement and return 204', async () => {
      const movementId = 1;

      (MovementService.deleteById as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app.server).delete(`/movements/${movementId}`);

      expect(response.status).toBe(204);
    });
  });

  describe('GET /versions/:versionId/movements', () => {
    it('should return a list of movements for a version', async () => {
      const versionId = 1;
      const movements = [{ id: 1, name: 'Test' }];

      (MovementService.findByVersionId as jest.Mock).mockResolvedValue(movements);

      const response = await request(app.server).get(`/versions/${versionId}/movements`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(movements);
    });
  });

  describe('GET /movements', () => {
    it('should return a list of all movements', async () => {
      const movements = [{ id: 1, name: 'Test' }];

      (MovementService.findAll as jest.Mock).mockResolvedValue(movements);

      const response = await request(app.server).get(`/movements`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(movements);
    });
  });
});
