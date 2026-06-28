-- CreateEnum
CREATE TYPE "IncomeType" AS ENUM ('MONTHLY', 'EXTRA');

-- CreateTable
CREATE TABLE "Income" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amountInCents" BIGINT NOT NULL,
    "type" "IncomeType" NOT NULL,
    "referenceMonth" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Income_userId_idx" ON "Income"("userId");

-- CreateIndex
CREATE INDEX "Income_userId_referenceMonth_idx" ON "Income"("userId", "referenceMonth");

-- CreateIndex
CREATE INDEX "Income_userId_type_idx" ON "Income"("userId", "type");

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
