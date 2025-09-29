import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { createMovementSchema, deleteMovementSchema, updateMovementSchema } from '../schemas/movementSchemas';
import { MovementService } from '../services/MovementService';
import { getSimulationVersionSchema } from '../schemas/simulationSchemas';

type CreateMovementRequest = FastifyRequest<{ 
  Params: z.infer<typeof createMovementSchema.params>;
  Body: z.infer<typeof createMovementSchema.body>;
}>;

type UpdateMovementRequest = FastifyRequest<{
  Params: z.infer<typeof updateMovementSchema.params>;
  Body: z.infer<typeof updateMovementSchema.body>;
}>;

type DeleteMovementRequest = FastifyRequest<{
  Params: z.infer<typeof deleteMovementSchema.params>;
}>;

type GetMovementsRequest = FastifyRequest<{
  Params: z.infer<typeof getSimulationVersionSchema.params>;
}>;

export async function movementRoutes(app: FastifyInstance) {
  app.post(
    '/versions/:versionId/movements',
    { schema: createMovementSchema },
    async (request: CreateMovementRequest, reply: FastifyReply) => {
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
    async (request: UpdateMovementRequest, reply: FastifyReply) => {
      try {
        const { movementId } = request.params;
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

  app.delete(
    '/movements/:movementId',
    { schema: deleteMovementSchema },
    async (request: DeleteMovementRequest, reply: FastifyReply) => {
      try {
        const { movementId } = request.params;
        await MovementService.deleteById(movementId);
        return reply.status(204).send();
      } catch (error: any) {
        app.log.error(error);
        if (error.code === 'P2025') {
          return reply.status(404).send({ message: 'Movement not found.' });
        }
        return reply.status(500).send({ message: 'Error deleting movement.' });
      }
    },
  );

  app.get(
    '/versions/:versionId/movements',
    { schema: getSimulationVersionSchema }, 
    async (request: GetMovementsRequest, reply: FastifyReply) => {
      try {
        const { versionId } = request.params;
        const movements = await MovementService.findByVersionId(versionId);
        return reply.send(movements);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ message: 'Error fetching movements.' });
      }
    },
  );

  app.get(
    '/movements', 
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const movements = await MovementService.findAll();
        return reply.send(movements);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ message: 'Error fetching all movements.' });
      }
    },
  );
}