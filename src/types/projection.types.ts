import {SimulationVersion, Movement, AllocationRecord, Insurance } from '@prisma/client';

export type ProjectionParams = {
  simulationVersionId: number;
  status: 'Vivo' | 'Morto';
};

export type ProjectionResult = {
  year: number;
  financialPatrimony: number;
  nonFinancialPatrimony: number;
  totalPatrimony: number;
};

export type DetailedSimulationVersion = SimulationVersion & {
  movements: Movement[];
  allocationRecords: (AllocationRecord & { allocation: { type: string } })[];
  insurances: Insurance[];
};