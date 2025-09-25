import { FastifyInstance } from 'fastify';
import { ProjectionService } from '../services/ProjectionService';
import { getProjectionSchema } from '../schemas/simulationSchemas';

export async function simulationRoutes(app: FastifyInstance) {
  app.get(
    '/simulations/:id/projection',
    { schema: getProjectionSchema },
    async (request, reply) => {
      try {
        // CORREÇÃO AQUI: Apenas desestruture. Os tipos já são conhecidos.
        const { id } = request.params;
        const { status } = request.query;

        const projection = await ProjectionService.execute({
          simulationVersionId: id,
          status,
        });

        return reply.send(projection);
      } catch (error) {
        app.log.error(error);
        return reply
          .status(404)
          .send({ message: 'Simulation not found or an error occurred.' });
      }
    },
  );
}