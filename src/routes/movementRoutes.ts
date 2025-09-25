import { FastifyInstance } from 'fastify';
import { createMovementSchema } from '../schemas/movementSchemas';
import { MovementService } from '../services/MovementService';

export async function movementRoutes(app: FastifyInstance) {
  app.post(
    '/versions/:versionId/movements',
    { schema: createMovementSchema },
    async (request: any, reply) => {
      try {
        const { versionId } = request.params;
        const movement = await MovementService.create(versionId, request.body);
        return reply.status(201).send(movement);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ message: 'Error creating movement.' });
      }
    },
  );
}