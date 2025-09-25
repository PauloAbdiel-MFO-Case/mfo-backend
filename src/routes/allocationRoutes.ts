import { FastifyInstance } from 'fastify';
import { createAllocationRecordSchema, createAllocationSchema } from '../schemas/allocationSchemas';
import { AllocationService } from '../services/AllocationService';

export async function allocationRoutes(app: FastifyInstance) {
  app.post(
    '/versions/:versionId/allocations',
    { schema: createAllocationSchema },
    async (request: any, reply) => {
      try {
        const { versionId } = request.params;
        const allocation = await AllocationService.create(
          versionId,
          request.body,
        );
        return reply.status(201).send(allocation);
      } catch (error) {
        app.log.error(error);
        return reply
          .status(500)
          .send({ message: 'Error creating allocation.' });
      }
    },
  );

  app.post(
    '/allocations/:allocationId/records',
    { schema: createAllocationRecordSchema },
    async (request: any, reply) => {
      try {
        const { allocationId } : any = request.params;
        const newRecord = await AllocationService.addRecord(
          allocationId,
          request.body,
        );
        return reply.status(201).send(newRecord);
      } catch (error: any) {
        app.log.error(error);
        if (error.code === 'P2003') {
          return reply
            .status(404)
            .send({ message: 'Allocation or Simulation Version not found.' });
        }
        return reply
          .status(500)
          .send({ message: 'Error adding allocation record.' });
      }
    },
  );
}