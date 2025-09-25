import { FastifyInstance } from 'fastify';
import { ProjectionService } from '../services/ProjectionService';
import { deleteSimulationSchema, getProjectionSchema } from '../schemas/simulationSchemas';
import { SimulationService } from 'src/services/SimulationService';

export async function simulationRoutes(app: FastifyInstance) {
  app.get('/simulations', async (request, reply) => {
    try {
      const simulations = await SimulationService.listAll();
      return reply.send(simulations);
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ message: 'Error listing simulations.' });
    }
  });

  app.delete(
    '/simulations/versions/:id',
    { schema: deleteSimulationSchema },
    async (request, reply) => {
      try {
        const { id } = request.params;
        await SimulationService.deleteById(id);
        // O código 204 significa "No Content", a resposta padrão para um DELETE bem-sucedido.
        return reply.status(204).send();
      } catch (error: any) {
        app.log.error(error);
        // Se a regra de negócio for violada (tentar deletar "Situação Atual")
        if (error.message.includes('Cannot delete')) {
          return reply.status(400).send({ message: error.message });
        }
        // Se o Prisma não encontrar o ID para deletar
        if (error.code === 'P2025') {
            return reply.status(404).send({ message: 'Simulation version not found.' });
        }
        return reply
          .status(500)
          .send({ message: 'Error deleting simulation.' });
      }
    },
  );

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