import { FastifyInstance } from 'fastify';
import { createAllocationSchema } from '../schemas/allocationSchemas';
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
}