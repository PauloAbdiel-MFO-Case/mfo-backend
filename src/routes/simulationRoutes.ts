import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { ProjectionService } from '../services/ProjectionService';
import { createNewVersionSchema, createSimulationSchema, deleteSimulationSchema, getProjectionSchema, getSimulationVersionSchema, updateSimulationSchema } from '../schemas/simulationSchemas';
import { SimulationService } from '../services/SimulationService';

type DeleteSimulationRequest = FastifyRequest<{ 
  Params: z.infer<typeof deleteSimulationSchema.params>;
}>;

type GetProjectionRequest = FastifyRequest<{
  Params: z.infer<typeof getProjectionSchema.params>;
  Querystring: z.infer<typeof getProjectionSchema.querystring>;
}>;

type CreateSimulationRequest = FastifyRequest<{
  Body: z.infer<typeof createSimulationSchema.body>;
}>;

type UpdateSimulationRequest = FastifyRequest<{
  Params: z.infer<typeof updateSimulationSchema.params>;
  Body: z.infer<typeof updateSimulationSchema.body>;
}>;

type CreateNewVersionRequest = FastifyRequest<{
  Params: z.infer<typeof createNewVersionSchema.params>;
}>;

type GetSimulationVersionRequest = FastifyRequest<{
  Params: z.infer<typeof getSimulationVersionSchema.params>;
}>;

export async function simulationRoutes(app: FastifyInstance) {
  app.get('/simulations', async (request: FastifyRequest, reply: FastifyReply) => {
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
    async (request: DeleteSimulationRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        await SimulationService.deleteById(id);
        return reply.status(204).send();
      } catch (error: any) {
        app.log.error(error);
        if (error.message.includes('Cannot delete')) {
          return reply.status(400).send({ message: error.message });
        }
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
    async (request: GetProjectionRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const { status, calculateWithoutInsurance } = request.query;

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
    async (request: CreateSimulationRequest, reply: FastifyReply) => {
      try {
        const { sourceVersionId, newName } = request.body;
        const newSimulation = await SimulationService.createFromVersion(
          sourceVersionId,
          newName,
        );
        return reply.status(201).send(newSimulation);
      } catch (error: any) {
        app.log.error(error);
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
    async (request: UpdateSimulationRequest, reply: FastifyReply) => {
      try {
        const { versionId } = request.params;
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
    async (request: CreateNewVersionRequest, reply: FastifyReply) => {
      try {
        const { simulationId } = request.params;
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
    async (request: GetSimulationVersionRequest, reply: FastifyReply) => {
      try {
        const { versionId } = request.params;
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

  app.get('/simulations/history', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const history = await SimulationService.listAllWithVersions();
      return reply.send(history);
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ message: 'Error fetching simulation history.' });
    }
  });
}