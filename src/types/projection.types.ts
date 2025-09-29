export type ProjectionParams = {
  simulationVersionId: number;
  status: 'Vivo' | 'Morto';
  calculateWithoutInsurance?: boolean;
};

export type ProjectionResult = {
  year: number;
  financialPatrimony: number;
  nonFinancialPatrimony: number;
  totalPatrimony: number;
};

export type FullProjectionResult = {
  withInsurance: ProjectionResult[];
  withoutInsurance?: ProjectionResult[];
};