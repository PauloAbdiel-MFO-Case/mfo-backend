-- CreateEnum
CREATE TYPE "public"."MovementType" AS ENUM ('ENTRADA', 'SAIDA', 'IMOBILIZADA');

-- CreateTable
CREATE TABLE "public"."Simulation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SimulationVersion" (
    "id" SERIAL NOT NULL,
    "simulationId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "realInterestRate" DOUBLE PRECISION NOT NULL,
    "isLegacy" BOOLEAN NOT NULL DEFAULT false,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimulationVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Allocation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Allocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AllocationRecord" (
    "id" SERIAL NOT NULL,
    "allocationId" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "simulationVersionId" INTEGER,
    "initialPayment" DOUBLE PRECISION,
    "installments" INTEGER,
    "interestRate" DOUBLE PRECISION,

    CONSTRAINT "AllocationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Movement" (
    "id" SERIAL NOT NULL,
    "simulationVersionId" INTEGER NOT NULL,
    "type" "public"."MovementType" NOT NULL,
    "description" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Insurance" (
    "id" SERIAL NOT NULL,
    "simulationVersionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "monthlyPremium" DOUBLE PRECISION NOT NULL,
    "insuredValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Insurance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Simulation_name_key" ON "public"."Simulation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SimulationVersion_simulationId_version_key" ON "public"."SimulationVersion"("simulationId", "version");

-- AddForeignKey
ALTER TABLE "public"."SimulationVersion" ADD CONSTRAINT "SimulationVersion_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "public"."Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AllocationRecord" ADD CONSTRAINT "AllocationRecord_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "public"."Allocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AllocationRecord" ADD CONSTRAINT "AllocationRecord_simulationVersionId_fkey" FOREIGN KEY ("simulationVersionId") REFERENCES "public"."SimulationVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Movement" ADD CONSTRAINT "Movement_simulationVersionId_fkey" FOREIGN KEY ("simulationVersionId") REFERENCES "public"."SimulationVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Insurance" ADD CONSTRAINT "Insurance_simulationVersionId_fkey" FOREIGN KEY ("simulationVersionId") REFERENCES "public"."SimulationVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
