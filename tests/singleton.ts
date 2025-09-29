import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'

jest.mock('@/prisma/client', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}))

export const prismaMock = require('@/prisma/client').prisma as unknown as DeepMockProxy<PrismaClient>

beforeEach(() => {
  mockReset(prismaMock)
})
