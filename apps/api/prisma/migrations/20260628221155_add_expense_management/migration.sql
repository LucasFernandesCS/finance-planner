-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('WATER', 'ENERGY', 'CONDOMINIUM', 'RENT', 'IPVA', 'IPTU', 'INTERNET', 'HEALTH', 'EDUCATION', 'TRANSPORT', 'FOOD', 'GROCERIES', 'SHOPPING', 'LEISURE', 'SUBSCRIPTION', 'MAINTENANCE', 'TAX', 'OTHER');

-- CreateTable
CREATE TABLE "FixedExpense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amountInCents" BIGINT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "startMonth" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixedExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariableExpense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amountInCents" BIGINT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "referenceMonth" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariableExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FixedExpense_userId_idx" ON "FixedExpense"("userId");

-- CreateIndex
CREATE INDEX "FixedExpense_userId_startMonth_idx" ON "FixedExpense"("userId", "startMonth");

-- CreateIndex
CREATE INDEX "FixedExpense_userId_category_idx" ON "FixedExpense"("userId", "category");

-- CreateIndex
CREATE INDEX "VariableExpense_userId_idx" ON "VariableExpense"("userId");

-- CreateIndex
CREATE INDEX "VariableExpense_userId_referenceMonth_idx" ON "VariableExpense"("userId", "referenceMonth");

-- CreateIndex
CREATE INDEX "VariableExpense_userId_category_idx" ON "VariableExpense"("userId", "category");

-- AddForeignKey
ALTER TABLE "FixedExpense" ADD CONSTRAINT "FixedExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariableExpense" ADD CONSTRAINT "VariableExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
