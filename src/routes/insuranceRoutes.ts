import { FastifyInstance } from 'fastify';
import {
  createInsuranceSchema,
  deleteInsuranceSchema,
  updateInsuranceSchema,
} from '../schemas/insuranceSchemas';
import { InsuranceService } from '../services/InsuranceService';

export async function insuranceRoutes(app: FastifyInstance) {
  app.post(
    '/versions/:versionId/insurances',
    { schema: createInsuranceSchema },
    async (request : any, reply) => {
      try {
        const { versionId } : any = request.params;
        const insurance = await InsuranceService.create(versionId, request.body);
        return reply.status(201).send(insurance);
      } catch (error: any) {
        if (error.code === 'P2003') {
          return reply.status(404).send({ message: 'Simulation Version not found.' });
        }
        return reply.status(500).send({ message: 'Error creating insurance.' });
      }
    },
  );

  app.put(
    '/insurances/:insuranceId',
    { schema: updateInsuranceSchema },
    async (request, reply) => {
      try {
        const { insuranceId } : any = request.params;
        const insurance = await InsuranceService.update(insuranceId, request.body);
        return reply.send(insurance);
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.status(404).send({ message: 'Insurance not found.' });
        }
        return reply.status(500).send({ message: 'Error updating insurance.' });
      }
    },
  );

  app.delete(
    '/insurances/:insuranceId',
    { schema: deleteInsuranceSchema },
    async (request, reply) => {
      try {
        const { insuranceId } : any = request.params;
        await InsuranceService.deleteById(insuranceId);
        return reply.status(204).send();
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.status(404).send({ message: 'Insurance not found.' });
        }
        return reply.status(500).send({ message: 'Error deleting insurance.' });
      }
    },
  );
}