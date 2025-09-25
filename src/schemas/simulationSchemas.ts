import { z } from 'zod';

export const getProjectionSchema = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  querystring: z.object({
    status: z.enum(['Vivo', 'Morto']),
  }),
};