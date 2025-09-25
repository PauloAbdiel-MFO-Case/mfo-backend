import { FastifyInstance } from 'fastify';
import { createMovementSchema, updateMovementSchema } from '../schemas/movementSchemas';
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

   app.put(
    '/movements/:movementId',
    { schema: updateMovementSchema },
    async (request, reply) => {
      try {
        const { movementId } : any = request.params;
        const updatedMovement = await MovementService.update(
          movementId,
          request.body,
        );
        return reply.send(updatedMovement);
      } catch (error: any) {
        app.log.error(error);
        // Se o Prisma não encontrar o ID para atualizar
        if (error.code === 'P2025') {
          return reply.status(404).send({ message: 'Movement not found.' });
        }
        return reply.status(500).send({ message: 'Error updating movement.' });
      }
    },
  );
}