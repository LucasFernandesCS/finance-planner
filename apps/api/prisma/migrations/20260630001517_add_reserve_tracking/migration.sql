-- CreateEnum
CREATE TYPE "ReserveStatus" AS ENUM ('BUILDING', 'PROTECTED', 'REPLENISHING');

-- CreateEnum
CREATE TYPE "ReserveTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL');

-- CreateTable
CREATE TABLE "EmergencyReserve" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "protectionMonths" INTEGER NOT NULL,
    "currentBalanceInCents" BIGINT NOT NULL DEFAULT 0,
    "status" "ReserveStatus" NOT NULL DEFAULT 'BUILDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyReserve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReserveTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reserveId" TEXT NOT NULL,
    "type" "ReserveTransactionType" NOT NULL,
    "amountInCents" BIGINT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReserveTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyReserve_userId_key" ON "EmergencyReserve"("userId");

-- CreateIndex
CREATE INDEX "EmergencyReserve_userId_idx" ON "EmergencyReserve"("userId");

-- CreateIndex
CREATE INDEX "EmergencyReserve_userId_status_idx" ON "EmergencyReserve"("userId", "status");

-- CreateIndex
CREATE INDEX "ReserveTransaction_userId_idx" ON "ReserveTransaction"("userId");

-- CreateIndex
CREATE INDEX "ReserveTransaction_reserveId_idx" ON "ReserveTransaction"("reserveId");

-- CreateIndex
CREATE INDEX "ReserveTransaction_userId_occurredAt_idx" ON "ReserveTransaction"("userId", "occurredAt");

-- AddForeignKey
ALTER TABLE "EmergencyReserve" ADD CONSTRAINT "EmergencyReserve_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveTransaction" ADD CONSTRAINT "ReserveTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveTransaction" ADD CONSTRAINT "ReserveTransaction_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "EmergencyReserve"("id") ON DELETE CASCADE ON UPDATE CASCADE;
