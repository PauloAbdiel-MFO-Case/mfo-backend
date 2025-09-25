import { z } from 'zod';

export const createAllocationSchema = {
  params: z.object({
    versionId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: z.string().min(1),
    type: z.enum(['FINANCEIRA', 'IMOBILIZADA']),
    value: z.number().positive(),
    date: z.coerce.date(),
    // Campos opcionais para financiamento 
    initialPayment: z.number().optional(),
    installments: z.number().int().positive().optional(),
    interestRate: z.number().positive().optional(),
  }),
};

export const createAllocationRecordSchema = {
  params: z.object({
    allocationId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    // Precisamos saber a qual versão da simulação este novo registro pertence
    simulationVersionId: z.number().int().positive(),
    value: z.number().positive(),
    date: z.coerce.date(),
  }),
};

export const updateAllocationRecordSchema = {
  params: z.object({
    recordId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    value: z.number().positive().optional(),
    date: z.coerce.date().optional(),
  }),
};

export const deleteAllocationRecordSchema = {
  params: z.object({
    recordId: z.coerce.number().int().positive(),
  }),
};