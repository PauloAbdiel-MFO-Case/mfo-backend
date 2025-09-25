import { Movement, AllocationRecord, Allocation } from '@prisma/client';
import {
  ProjectionParams,
  ProjectionResult,
} from '../types/projection.types';
import { SimulationRepository } from 'src/repositories/simulationRepository';


async function execute({
  simulationVersionId,
  status,
}: ProjectionParams): Promise<ProjectionResult[]> {
    
  const simulationVersion  = 
    await SimulationRepository.findVersionByIdWithDetails(simulationVersionId);

  const startYear = simulationVersion.startDate.getFullYear();
  const results: ProjectionResult[] = [];

  type AllocationRecordWithAllocation = AllocationRecord & {
    allocation: Allocation;
  };

  const initialFinancialPatrimony =
    simulationVersion.allocationRecords.reduce(
      (sum: number, record: AllocationRecordWithAllocation) => {
        return record.allocation.type === 'FINANCEIRA'
          ? sum + record.value
          : sum;
      },
      0,
    );

  const initialNonFinancialPatrimony =
    simulationVersion.allocationRecords.reduce(
      (sum: number, record: AllocationRecordWithAllocation) => {
        return record.allocation.type === 'IMOBILIZADA'
          ? sum + record.value
          : sum;
      },
      0,
    );

  let currentFinancialPatrimony = initialFinancialPatrimony;

  for (let year = startYear; year <= 2060; year++) {
    if (year > startYear) {
      currentFinancialPatrimony *= 1 + simulationVersion.realInterestRate;
    }

    const totalAnnualIncome = simulationVersion.movements
      .filter(
        (m: Movement) =>
          m.type === 'ENTRADA' &&
          m.startDate.getFullYear() <= year &&
          (!m.endDate || m.endDate.getFullYear() >= year),
      )
      .reduce((sum: number, m: Movement) => {
        const value = m.frequency === 'MENSAL' ? m.value * 12 : m.value;
        return sum + value;
      }, 0);

    let totalAnnualExpenses = simulationVersion.movements
      .filter(
        (m: Movement) =>
          m.type === 'SAIDA' &&
          m.startDate.getFullYear() <= year &&
          (!m.endDate || m.endDate.getFullYear() >= year),
      )
      .reduce((sum: number, m: Movement) => {
        const value = m.frequency === 'MENSAL' ? m.value * 12 : m.value;
        return sum + value;
      }, 0);

    if (status === 'Morto') {
      totalAnnualExpenses /= 2;
    }

    currentFinancialPatrimony += totalAnnualIncome - totalAnnualExpenses;

    const totalPatrimony =
      currentFinancialPatrimony + initialNonFinancialPatrimony;

    results.push({
      year,
      financialPatrimony: currentFinancialPatrimony,
      nonFinancialPatrimony: initialNonFinancialPatrimony,
      totalPatrimony: totalPatrimony,
    });
  }

  return results;
}

export const ProjectionService = {
  execute,
};