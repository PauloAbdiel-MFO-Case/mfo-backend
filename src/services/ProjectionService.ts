import { prisma } from '@/prisma/client';
import {
  ProjectionParams,
  ProjectionResult,
  FullProjectionResult,
} from '@/types/projection.types';
import { Movement, Insurance, SimulationVersion, AllocationRecord, Allocation } from '@prisma/client';

interface ProjectionCalculationParams {
  simulationVersion: SimulationVersion & { movements: Movement[]; insurances: Insurance[] };
  status: 'Vivo' | 'Morto';
  initialAllocationRecords: (AllocationRecord & { allocation: Allocation })[];
  includeInsurance: boolean;
}

function calculateProjection({
  simulationVersion,
  status,
  initialAllocationRecords,
  includeInsurance,
}: ProjectionCalculationParams): ProjectionResult[] {
  const startYear = simulationVersion.startDate.getFullYear();
  const results: ProjectionResult[] = [];

  const initialFinancialPatrimony = initialAllocationRecords.reduce(
    (sum, record) => (record.allocation.type === 'FINANCEIRA' ? sum + record.value : sum),
    0,
  );

  const initialNonFinancialPatrimony = initialAllocationRecords.reduce(
    (sum, record) => (record.allocation.type === 'IMOBILIZADA' ? sum + record.value : sum),
    0,
  );

  let currentFinancialPatrimony = initialFinancialPatrimony;

  for (let year = startYear; year <= 2060; year++) {
    if (year > startYear) {
      currentFinancialPatrimony *= 1 + simulationVersion.realInterestRate;
    }

    const totalAnnualIncome = simulationVersion.movements
      .filter(
        (m) =>
          m.type === 'ENTRADA' &&
          m.startDate.getFullYear() <= year &&
          (!m.endDate || m.endDate.getFullYear() >= year),
      )
      .reduce((sum, m) => {
        const value = m.frequency === 'MENSAL' ? m.value * 12 : m.value;
        return sum + value;
      }, 0);

    let totalAnnualExpenses = simulationVersion.movements
      .filter(
        (m) =>
          m.type === 'SAIDA' &&
          m.startDate.getFullYear() <= year &&
          (!m.endDate || m.endDate.getFullYear() >= year),
      )
      .reduce((sum, m) => {
        const value = m.frequency === 'MENSAL' ? m.value * 12 : m.value;
        return sum + value;
      }, 0);
    
    if (includeInsurance) {
      totalAnnualExpenses += simulationVersion.insurances
        .filter(
          (i) =>
            new Date(i.startDate).getFullYear() <= year &&
            (new Date(i.startDate).getFullYear() + i.durationMonths / 12) >= year
        )
        .reduce((sum, i) => sum + i.monthlyPremium * 12, 0);
    }

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

async function execute({
  simulationVersionId,
  status,
  calculateWithoutInsurance = false,
}: ProjectionParams): Promise<FullProjectionResult> {
  const simulationVersion = await prisma.simulationVersion.findUniqueOrThrow({
    where: { id: simulationVersionId },
    include: {
      movements: true,
      insurances: true,
    },
  });

  const relevantAllocationIds = (
    await prisma.allocationRecord.findMany({
      where: { simulationVersionId },
      select: { allocationId: true },
      distinct: ['allocationId'],
    })
  ).map((r) => r.allocationId);

  const initialAllocationRecords = await prisma.allocationRecord.findMany({
    where: {
      allocationId: { in: relevantAllocationIds },
      date: { lte: simulationVersion.startDate }, 
    },
    orderBy: { date: 'desc' },
    distinct: ['allocationId'], 
    include: { allocation: true },
  });

  const withInsuranceResults = calculateProjection({
    simulationVersion,
    status,
    initialAllocationRecords,
    includeInsurance: true,
  });

  const fullResult: FullProjectionResult = {
    withInsurance: withInsuranceResults,
  };

  if (calculateWithoutInsurance) {
    const withoutInsuranceResults = calculateProjection({
      simulationVersion,
      status,
      initialAllocationRecords,
      includeInsurance: false,
    });
    fullResult.withoutInsurance = withoutInsuranceResults;
  }

  return fullResult;
}

export const ProjectionService = {
  execute,
};