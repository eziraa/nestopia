/*
  Warnings:

  - You are about to drop the column `tenantId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `Lease` table. All the data in the column will be lost.
  - You are about to drop the column `managerId` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cognitoId]` on the table `Manager` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cognitoId]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantCognitoId` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantCognitoId` to the `Lease` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cognitoId` to the `Manager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `managerCognitoId` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cognitoId` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Lease" DROP CONSTRAINT "Lease_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_managerId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "tenantId",
ADD COLUMN     "tenantCognitoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Lease" DROP COLUMN "tenantId",
ADD COLUMN     "tenantCognitoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Manager" ADD COLUMN     "cognitoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "managerId",
ADD COLUMN     "managerCognitoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "cognitoId" TEXT NOT NULL;

-- DropTable
DROP TABLE "User";

-- CreateIndex
CREATE UNIQUE INDEX "Manager_cognitoId_key" ON "Manager"("cognitoId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_cognitoId_key" ON "Tenant"("cognitoId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_managerCognitoId_fkey" FOREIGN KEY ("managerCognitoId") REFERENCES "Manager"("cognitoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_tenantCognitoId_fkey" FOREIGN KEY ("tenantCognitoId") REFERENCES "Tenant"("cognitoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_tenantCognitoId_fkey" FOREIGN KEY ("tenantCognitoId") REFERENCES "Tenant"("cognitoId") ON DELETE RESTRICT ON UPDATE CASCADE;
