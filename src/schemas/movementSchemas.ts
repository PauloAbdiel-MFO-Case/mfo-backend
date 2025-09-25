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