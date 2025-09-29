import { ProjectionService } from '@/services/ProjectionService';
import { prismaMock } from '@/tests/singleton';

describe('ProjectionService', () => {
  describe('execute', () => {
    it('should execute a projection and return the correct results', async () => {
      const params = { simulationVersionId: 1, status: 'Vivo' as const };

      const simulationVersion = {
        id: 1,
        startDate: new Date('2023-01-01T12:00:00'),
        realInterestRate: 0.05,
        movements: [
          { type: 'ENTRADA', value: 5000, frequency: 'MENSAL', startDate: new Date('2023-01-01T12:00:00'), endDate: null },
          { type: 'SAIDA', value: 2000, frequency: 'MENSAL', startDate: new Date('2023-01-01T12:00:00'), endDate: null },
        ],
        insurances: [
          { monthlyPremium: 100, startDate: new Date('2023-01-01T12:00:00'), durationMonths: 120 },
        ],
      };

      const allocationRecords = [
        { allocationId: 1, allocation: { type: 'FINANCEIRA' }, value: 100000, date: new Date('2022-01-01') },
        { allocationId: 2, allocation: { type: 'IMOBILIZADA' }, value: 500000, date: new Date('2022-01-01') },
      ];

      prismaMock.simulationVersion.findUniqueOrThrow.mockResolvedValue(simulationVersion as any);
      prismaMock.allocationRecord.findMany.mockResolvedValueOnce([{ allocationId: 1 }, { allocationId: 2 }] as any)
                                           .mockResolvedValueOnce(allocationRecords as any);

      const results = await ProjectionService.execute(params);

      expect(results).toHaveLength(2060 - 2023 + 1);

      // Check the first year (2023)
      const firstYear = results[0];
      expect(firstYear.year).toBe(2023);
      expect(firstYear.nonFinancialPatrimony).toBe(500000);
      const annualIncome = 5000 * 12;
      const annualExpenses = (2000 * 12) + (100 * 12);
      const expectedFinancialPatrimony2023 = 100000 + annualIncome - annualExpenses;
      expect(firstYear.financialPatrimony).toBeCloseTo(expectedFinancialPatrimony2023);
      expect(firstYear.totalPatrimony).toBeCloseTo(expectedFinancialPatrimony2023 + 500000);

      // Check the second year (2024)
      const secondYear = results[1];
      expect(secondYear.year).toBe(2024);
      const expectedFinancialPatrimony2024 = (expectedFinancialPatrimony2023 * 1.05) + annualIncome - annualExpenses;
      expect(secondYear.financialPatrimony).toBeCloseTo(expectedFinancialPatrimony2024);
    });

    it('should halve expenses if status is \'Morto\'', async () => {
        const params = { simulationVersionId: 1, status: 'Morto' as const };
  
        const simulationVersion = {
          id: 1,
          startDate: new Date('2023-01-01T12:00:00'),
          realInterestRate: 0.05,
          movements: [
            { type: 'SAIDA', value: 2000, frequency: 'MENSAL', startDate: new Date('2023-01-01T12:00:00'), endDate: null },
          ],
          insurances: [],
        };
  
        prismaMock.simulationVersion.findUniqueOrThrow.mockResolvedValue(simulationVersion as any);
        prismaMock.allocationRecord.findMany.mockResolvedValueOnce([] as any).mockResolvedValueOnce([] as any);
  
        const results = await ProjectionService.execute(params);
  
        const annualExpenses = (2000 * 12) / 2;
        const expectedFinancialPatrimony2023 = 0 - annualExpenses;
        expect(results[0].financialPatrimony).toBeCloseTo(expectedFinancialPatrimony2023);
      });
  });
});
