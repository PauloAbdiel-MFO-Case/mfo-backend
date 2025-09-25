
import { prisma } from '../prisma/client';
import {
  ProjectionParams,
  ProjectionResult,
} from '../types/projection.types';

async function execute({
  simulationVersionId,
  status,
}: ProjectionParams): Promise<ProjectionResult[]> {
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
  ).map((r: any) => r.allocationId);

  const initialAllocationRecords = await prisma.allocationRecord.findMany({
    where: {
      allocationId: { in: relevantAllocationIds },
      date: { lte: simulationVersion.startDate }, 
    },
    orderBy: { date: 'desc' },
    distinct: ['allocationId'], 
    include: { allocation: true },
  });

  const startYear = simulationVersion.startDate.getFullYear();
  const results: ProjectionResult[] = [];

  const initialFinancialPatrimony = initialAllocationRecords.reduce(
    (sum: any, record: any) => {
      return record.allocation.type === 'FINANCEIRA' ? sum + record.value : sum;
    },
    0,
  );

  const initialNonFinancialPatrimony = initialAllocationRecords.reduce(
    (sum: any, record: any) => {
      return record.allocation.type === 'IMOBILIZADA' ? sum + record.value : sum;
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
        (m: any) =>
          m.type === 'ENTRADA' &&
          m.startDate.getFullYear() <= year &&
          (!m.endDate || m.endDate.getFullYear() >= year),
      )
      .reduce((sum: any, m: any) => {
        const value = m.frequency === 'MENSAL' ? m.value * 12 : m.value;
        return sum + value;
      }, 0);

    let totalAnnualExpenses = simulationVersion.movements
      .filter(
        (m: any) =>
          m.type === 'SAIDA' &&
          m.startDate.getFullYear() <= year &&
          (!m.endDate || m.endDate.getFullYear() >= year),
      )
      .reduce((sum: any, m: any) => {
        const value = m.frequency === 'MENSAL' ? m.value * 12 : m.value;
        return sum + value;
      }, 0);
    
    totalAnnualExpenses += simulationVersion.insurances
      .filter(
        (i: any) =>
          simulationVersion.startDate.getFullYear() <= year &&
          new Date(i.startDate).setMonth(new Date(i.startDate).getMonth() + i.durationMonths) >= new Date().setFullYear(year)
      )
      .reduce((sum: any, i: any) => sum + i.monthlyPremium * 12, 0);


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