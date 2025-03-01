/*
  Warnings:

  - You are about to drop the column `tenantCognitoId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `tenantCognitoId` on the `Lease` table. All the data in the column will be lost.
  - You are about to drop the column `cognitoId` on the `Manager` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Manager` table. All the data in the column will be lost.
  - You are about to drop the column `managerCognitoId` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `cognitoId` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Tenant` table. All the data in the column will be lost.
  - Added the required column `tenantId` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Lease` table without a default value. This is not possible if the table is not empty.
  - Added the required column `managerId` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_tenantCognitoId_fkey";

-- DropForeignKey
ALTER TABLE "Lease" DROP CONSTRAINT "Lease_tenantCognitoId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_managerCognitoId_fkey";

-- DropIndex
DROP INDEX "Manager_cognitoId_key";

-- DropIndex
DROP INDEX "Tenant_cognitoId_key";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "tenantCognitoId",
ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Lease" DROP COLUMN "tenantCognitoId",
ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Manager" DROP COLUMN "cognitoId",
DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "managerCognitoId",
ADD COLUMN     "managerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "cognitoId",
DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
