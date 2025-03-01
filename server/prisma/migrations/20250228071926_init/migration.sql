-- AlterTable
ALTER TABLE "Manager" ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" ALTER COLUMN "password" DROP NOT NULL;
