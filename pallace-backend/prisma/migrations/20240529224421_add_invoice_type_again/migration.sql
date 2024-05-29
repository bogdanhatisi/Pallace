-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('SENT', 'RECEIVED');

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "type" "InvoiceType" NOT NULL DEFAULT 'SENT';
