import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { createAllocationRecordSchema, createAllocationSchema, deleteAllocationRecordSchema, deleteAllocationSchema, updateAllocationRecordSchema } from '../schemas/allocationSchemas';
import { AllocationService } from '../services/AllocationService';
import { getSimulationVersionSchema } from '../schemas/simulationSchemas';

type CreateAllocationRequest = FastifyRequest<{ 
  Params: z.infer<typeof createAllocationSchema.params>;
  Body: z.infer<typeof createAllocationSchema.body>;
}>;

type CreateAllocationRecordRequest = FastifyRequest<{
  Params: z.infer<typeof createAllocationRecordSchema.params>;
  Body: z.infer<typeof createAllocationRecordSchema.body>;
}>;

type UpdateAllocationRecordRequest = FastifyRequest<{
  Params: z.infer<typeof updateAllocationRecordSchema.params>;
  Body: z.infer<typeof updateAllocationRecordSchema.body>;
}>;

type DeleteAllocationRecordRequest = FastifyRequest<{
  Params: z.infer<typeof deleteAllocationRecordSchema.params>;
}>;

type DeleteAllocationRequest = FastifyRequest<{
  Params: z.infer<typeof deleteAllocationSchema.params>;
}>;

type GetAllocationRecordsRequest = FastifyRequest<{
  Params: z.infer<typeof getSimulationVersionSchema.params>;
}>;

export async function allocationRoutes(app: FastifyInstance) {
  app.post(
    '/versions/:versionId/allocations',
    { schema: createAllocationSchema },
    async (request: CreateAllocationRequest, reply: FastifyReply) => {
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
    async (request: CreateAllocationRecordRequest, reply: FastifyReply) => {
      try {
        const { allocationId } = request.params;
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

   app.put(
    '/allocation-records/:recordId',
    { schema: updateAllocationRecordSchema },
    async (request: UpdateAllocationRecordRequest, reply: FastifyReply) => {
      try {
        const { recordId } = request.params;
        const updatedRecord = await AllocationService.updateRecord(
          recordId,
          request.body,
        );
        return reply.send(updatedRecord);
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.status(404).send({ message: 'Record not found.' });
        }
        return reply
          .status(500)
          .send({ message: 'Error updating allocation record.' });
      }
    },
  );

  app.delete(
    '/allocation-records/:recordId',
    { schema: deleteAllocationRecordSchema },
    async (request: DeleteAllocationRecordRequest, reply: FastifyReply) => {
      try {
        const { recordId } = request.params;
        await AllocationService.deleteRecord(recordId);
        return reply.status(204).send();
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.status(404).send({ message: 'Record not found.' });
        }
        return reply
          .status(500)
          .send({ message: 'Error deleting allocation record.' });
      }
    },
  );

  app.delete(
    '/allocations/:allocationId',
    { schema: deleteAllocationSchema },
    async (request: DeleteAllocationRequest, reply: FastifyReply) => {
      try {
        const { allocationId } = request.params;
        await AllocationService.deleteById(allocationId);
        return reply.status(204).send();
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.status(404).send({ message: 'Allocation not found.' });
        }
        return reply
          .status(500)
          .send({ message: 'Error deleting allocation.' });
      }
    },
  );

  app.get(
    '/versions/:versionId/allocation-records',
    { schema: getSimulationVersionSchema },
    async (request: GetAllocationRecordsRequest, reply: FastifyReply) => {
      try {
        const { versionId } = request.params;
        const records = await AllocationService.findByVersionId(versionId);
        return reply.send(records);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ message: 'Error fetching allocation records.' });
      }
    },
  );

  app.get(
    '/allocations',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const records = await AllocationService.findAll();
        return reply.send(records);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ message: 'Error fetching all allocation records.' });
      }
    },
  );
}