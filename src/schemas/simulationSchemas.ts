import { z } from 'zod';

export const getProjectionSchema = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  querystring: z.object({
    status: z.enum(['Vivo', 'Morto']),
  }),
};

export const deleteSimulationSchema = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
};

export const createSimulationSchema = {
  body: z.object({
    sourceVersionId: z.number().int().positive(),
    newName: z.string().min(1, { message: 'Name cannot be empty' }),
  }),
};

export const updateSimulationSchema = {
  params: z.object({
    versionId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    startDate: z.coerce.date().optional(),
    realInterestRate: z.number().positive().optional(),
  }),
};

export const createNewVersionSchema = {
  params: z.object({
    simulationId: z.coerce.number().int().positive(),
  }),
};

export const getSimulationVersionSchema = {
  params: z.object({
    versionId: z.coerce.number().int().positive(),
  }),
};