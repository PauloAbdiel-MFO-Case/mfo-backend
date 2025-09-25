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