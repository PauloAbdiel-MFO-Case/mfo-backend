import { FastifyInstance } from 'fastify';
import { ProjectionService } from '../services/ProjectionService';
import { createNewVersionSchema, createSimulationSchema, deleteSimulationSchema, getProjectionSchema, getSimulationVersionSchema, updateSimulationSchema } from '../schemas/simulationSchemas';
import { SimulationService } from '../services/SimulationService';

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
        const { id }: any = request.params;
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
        const { id }: any = request.params;
        const { status, calculateWithoutInsurance }: any = request.query;

        const projection = await ProjectionService.execute({
          simulationVersionId: id,
          status,
          calculateWithoutInsurance,
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

  app.post(
    '/simulations',
    { schema: createSimulationSchema },
    async (request, reply) => {
      try {
        const { sourceVersionId, newName } : any = request.body;
        const newSimulation = await SimulationService.createFromVersion(
          sourceVersionId,
          newName,
        );
        // Retorna 201 Created com o novo objeto
        return reply.status(201).send(newSimulation);
      } catch (error: any) {
        app.log.error(error);
        // Se o nome já existe, retorna 409 Conflict
        if (error.message.includes('already exists')) {
          return reply.status(409).send({ message: error.message });
        }
        return reply
          .status(500)
          .send({ message: 'Error creating new simulation.' });
      }
    },
  );

  app.put(
    '/simulations/versions/:versionId',
    { schema: updateSimulationSchema },
    async (request: any, reply) => {
      try {
        const { versionId }: any = request.params;
        const updatedVersion = await SimulationService.update(
          versionId,
          request.body,
        );
        return reply.send(updatedVersion);
      } catch (error: any) {
        if (error.message.includes('Situação Atual')) {
          return reply.status(400).send({ message: error.message });
        }
        if (error.code === 'P2025') {
          return reply.status(404).send({ message: 'Simulation version not found.' });
        }
        return reply
          .status(500)
          .send({ message: 'Error updating simulation.' });
      }
    },
  );

   app.post(
    '/simulations/:simulationId/versions',
    { schema: createNewVersionSchema },
    async (request, reply) => {
      try {
        const { simulationId } : any = request.params;
        const newVersion = await SimulationService.createNewVersion(simulationId);
        return reply.status(201).send(newVersion);
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.status(404).send({ message: 'Simulation not found.' });
        }
        return reply
          .status(500)
          .send({ message: 'Error creating new version.' });
      }
    },
  );

  app.get(
    '/simulations/versions/:versionId',
    { schema: getSimulationVersionSchema },
    async (request, reply) => {
      try {
        const { versionId }: any = request.params;
        const versionDetails = await SimulationService.findVersionById(versionId);
        return reply.send(versionDetails);
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply
            .status(404)
            .send({ message: 'Simulation version not found.' });
        }
        return reply
          .status(500)
          .send({ message: 'Error fetching simulation version.' });
      }
    },
  );

  app.get('/simulations/history', async (request, reply) => {
    try {
      const history = await SimulationService.listAllWithVersions();
      return reply.send(history);
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ message: 'Error fetching simulation history.' });
    }
  });
}