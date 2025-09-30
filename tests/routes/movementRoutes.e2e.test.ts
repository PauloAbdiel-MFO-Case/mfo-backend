import request from 'supertest';
import { buildApp } from '../../src/server';
import { FastifyInstance } from 'fastify';
import { MovementService } from '../../src/services/MovementService';

jest.mock('@/services/MovementService');

describe('Movement Routes', () => {
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

  describe('POST /versions/:versionId/movements', () => {
    it('should create a movement and return 201', async () => {
      const versionId = 1;
      const movementData = { 
        description: 'Test', 
        type: 'ENTRADA', 
        value: 1000, 
        frequency: 'MENSAL', 
        startDate: new Date().toISOString() 
      };
      const createdMovement = { id: 1, ...movementData };

      (MovementService.create as jest.Mock).mockResolvedValue(createdMovement);

      const response = await request(app.server)
        .post(`/versions/${versionId}/movements`)
        .send(movementData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdMovement);
    });
  });
});