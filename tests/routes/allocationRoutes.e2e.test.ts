import request from 'supertest';
import { buildApp } from '../../src/server';
import { AllocationService } from '@/services/AllocationService';
import { FastifyInstance } from 'fastify';

jest.mock('@/services/AllocationService');

describe('Allocation Routes', () => {
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

  describe('POST /versions/:versionId/allocations', () => {
    it('should create an allocation and return 201', async () => {
      const versionId = 1;
      const allocationData = { name: 'Test', type: 'FINANCEIRA', value: 100, date: new Date().toISOString() };
      const createdAllocation = { id: 1, ...allocationData };

      (AllocationService.create as jest.Mock).mockResolvedValue(createdAllocation);

      const response = await request(app.server)
        .post(`/versions/${versionId}/allocations`)
        .send(allocationData);

      expect(response.status).toBe(201);
      expect(response.body.name).toEqual(createdAllocation.name);
    });
  });
});