import request from 'supertest';
import { buildApp } from '../../src/server';
import { InsuranceService } from '@/services/InsuranceService';
import { FastifyInstance } from 'fastify';

jest.mock('@/services/InsuranceService');

describe('Insurance Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /versions/:versionId/insurances', () => {
    it('should create an insurance and return 201', async () => {
      const versionId = 1;
      const insuranceData = { 
        name: 'Test', 
        startDate: new Date().toISOString(), 
        monthlyPremium: 100, 
        insuredValue: 100000,
        durationMonths: 120
      };
      const createdInsurance = { id: 1, ...insuranceData };

      (InsuranceService.create as jest.Mock).mockResolvedValue(createdInsurance);

      const response = await request(app.server)
        .post(`/versions/${versionId}/insurances`)
        .send(insuranceData);

      expect(response.status).toBe(201);
      expect(response.body.name).toEqual(createdInsurance.name);
    });
  });

  describe('PUT /insurances/:insuranceId', () => {
    it('should update an insurance and return 200', async () => {
      const insuranceId = 1;
      const updateData = { name: 'Updated' };
      const updatedInsurance = { id: insuranceId, ...updateData };

      (InsuranceService.update as jest.Mock).mockResolvedValue(updatedInsurance);

      const response = await request(app.server)
        .put(`/insurances/${insuranceId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedInsurance);
    });
  });

  describe('DELETE /insurances/:insuranceId', () => {
    it('should delete an insurance and return 204', async () => {
      const insuranceId = 1;

      (InsuranceService.deleteById as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app.server).delete(`/insurances/${insuranceId}`);

      expect(response.status).toBe(204);
    });
  });

  describe('GET /versions/:versionId/insurances', () => {
    it('should return a list of insurances for a version', async () => {
      const versionId = 1;
      const insurances = [{ id: 1, name: 'Test' }];

      (InsuranceService.findByVersionId as jest.Mock).mockResolvedValue(insurances);

      const response = await request(app.server).get(`/versions/${versionId}/insurances`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(insurances);
    });
  });

  describe('GET /insurances', () => {
    it('should return a list of all insurances', async () => {
      const insurances = [{ id: 1, name: 'Test' }];

      (InsuranceService.findAll as jest.Mock).mockResolvedValue(insurances);

      const response = await request(app.server).get(`/insurances`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(insurances);
    });
  });
});
