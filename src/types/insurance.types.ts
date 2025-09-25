import { Prisma } from "@prisma/client";

export type InsuranceCreationData = Omit<
  Prisma.InsuranceUncheckedCreateInput,
  'simulationVersionId'
>;