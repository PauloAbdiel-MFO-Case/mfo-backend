import { z } from 'zod';

export const createInsuranceSchema = {
  params: z.object({
    versionId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: z.string().min(1),
    startDate: z.coerce.date(),
    durationMonths: z.number().int().positive(),
    monthlyPremium: z.number().positive(),
    insuredValue: z.number().positive(),
  }),
};

export const updateInsuranceSchema = {
  params: z.object({
    insuranceId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    startDate: z.coerce.date().optional(),
    durationMonths: z.number().int().positive().optional(),
    monthlyPremium: z.number().positive().optional(),
    insuredValue: z.number().positive().optional(),
  }),
};

export const deleteInsuranceSchema = {
  params: z.object({
    insuranceId: z.coerce.number().int().positive(),
  }),
};