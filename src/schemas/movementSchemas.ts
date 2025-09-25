import { z } from 'zod';

export const createMovementSchema = {
  params: z.object({
    versionId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    type: z.enum(['ENTRADA', 'SAIDA']),
    description: z.string().min(1),
    value: z.number().positive(),
    frequency: z.enum(['UNICA', 'MENSAL', 'ANUAL']),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
  }),
};

export const updateMovementSchema = {
  params: z.object({
    movementId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    type: z.enum(['ENTRADA', 'SAIDA']).optional(),
    description: z.string().min(1).optional(),
    value: z.number().positive().optional(),
    frequency: z.enum(['UNICA', 'MENSAL', 'ANUAL']).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional().nullable(),
  }),
};