import {SimulationVersion, Movement, AllocationRecord, Insurance } from '@prisma/client';

export type SimulationUpdateData = {
  name?: string;
  startDate?: Date;
  realInterestRate?: number;
};

export type DetailedSimulationVersion = SimulationVersion & {
  movements: Movement[];
  allocationRecords: (AllocationRecord & { allocation: { type: string } })[];
  insurances: Insurance[];
};