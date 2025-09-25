import { FastifyInstance } from 'fastify';
import { createAllocationRecordSchema, createAllocationSchema, deleteAllocationRecordSchema, updateAllocationRecordSchema } from '../schemas/allocationSchemas';
import { AllocationService } from '../services/AllocationService';
import { getSimulationVersionSchema } from 'src/schemas/simulationSchemas';

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

   app.put(
    '/allocation-records/:recordId',
    { schema: updateAllocationRecordSchema },
    async (request: any, reply) => {
      try {
        const { recordId } : any = request.params;
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
    async (request, reply) => {
      try {
        const { recordId }: any = request.params;
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

  app.get(
    '/versions/:versionId/allocation-records',
    { schema: getSimulationVersionSchema },
    async (request, reply) => {
      try {
        const { versionId } : any = request.params;
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
    async (request, reply) => {
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