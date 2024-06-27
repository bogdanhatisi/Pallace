-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'misc';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePicturePath" TEXT NOT NULL DEFAULT 'none';
