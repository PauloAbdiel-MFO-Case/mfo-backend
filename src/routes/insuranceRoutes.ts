import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  createInsuranceSchema,
  deleteInsuranceSchema,
  updateInsuranceSchema,
} from '../schemas/insuranceSchemas';
import { InsuranceService } from '../services/InsuranceService';
import { getSimulationVersionSchema } from '../schemas/simulationSchemas';

type CreateInsuranceRequest = FastifyRequest<{ 
  Params: z.infer<typeof createInsuranceSchema.params>;
  Body: z.infer<typeof createInsuranceSchema.body>;
}>;

type UpdateInsuranceRequest = FastifyRequest<{
  Params: z.infer<typeof updateInsuranceSchema.params>;
  Body: z.infer<typeof updateInsuranceSchema.body>;
}>;

type DeleteInsuranceRequest = FastifyRequest<{
  Params: z.infer<typeof deleteInsuranceSchema.params>;
}>;

type GetInsurancesRequest = FastifyRequest<{
  Params: z.infer<typeof getSimulationVersionSchema.params>;
}>;

export async function insuranceRoutes(app: FastifyInstance) {
  app.post(
    '/versions/:versionId/insurances',
    { schema: createInsuranceSchema },
    async (request : CreateInsuranceRequest, reply: FastifyReply) => {
      try {
        const { versionId } = request.params;
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
    async (request: UpdateInsuranceRequest, reply: FastifyReply) => {
      try {
        const { insuranceId } = request.params;
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
    async (request: DeleteInsuranceRequest, reply: FastifyReply) => {
      try {
        const { insuranceId } = request.params;
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

  app.get(
    '/versions/:versionId/insurances',
    { schema: getSimulationVersionSchema }, 
    async (request: GetInsurancesRequest, reply: FastifyReply) => {
      try {
        const { versionId } = request.params;
        const insurances = await InsuranceService.findByVersionId(versionId);
        return reply.send(insurances);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ message: 'Error fetching insurances.' });
      }
    },
  );

  app.get(
    '/insurances',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const insurances = await InsuranceService.findAll();
        return reply.send(insurances);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ message: 'Error fetching insurances.' });
      }
    },
  );
}