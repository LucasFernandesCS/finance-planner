-- CreateEnum
CREATE TYPE "DebtStatus" AS ENUM ('IN_PROGRESS', 'OVERDUE', 'PAID');

-- CreateEnum
CREATE TYPE "DebtType" AS ENUM ('INSTALLMENT', 'RECURRING', 'REVOLVING', 'INFORMAL_LOAN', 'FINANCING', 'OTHER');

-- AlterEnum
ALTER TYPE "ExpenseCategory" ADD VALUE 'DEBT_PAYMENT';

-- CreateTable
CREATE TABLE "Debt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "creditor" TEXT NOT NULL,
    "type" "DebtType" NOT NULL,
    "originalAmountInCents" BIGINT NOT NULL,
    "currentBalanceInCents" BIGINT NOT NULL,
    "installmentAmountInCents" BIGINT,
    "monthlyDueDay" INTEGER NOT NULL,
    "status" "DebtStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtPayment" (
    "id" TEXT NOT NULL,
    "debtId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountInCents" BIGINT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebtPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Debt_userId_idx" ON "Debt"("userId");

-- CreateIndex
CREATE INDEX "Debt_userId_status_idx" ON "Debt"("userId", "status");

-- CreateIndex
CREATE INDEX "Debt_userId_type_idx" ON "Debt"("userId", "type");

-- CreateIndex
CREATE INDEX "DebtPayment_debtId_idx" ON "DebtPayment"("debtId");

-- CreateIndex
CREATE INDEX "DebtPayment_userId_idx" ON "DebtPayment"("userId");

-- CreateIndex
CREATE INDEX "DebtPayment_userId_paidAt_idx" ON "DebtPayment"("userId", "paidAt");

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtPayment" ADD CONSTRAINT "DebtPayment_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtPayment" ADD CONSTRAINT "DebtPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
