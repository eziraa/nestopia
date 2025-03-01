/*
  Warnings:

  - Added the required column `password` to the `Manager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Manager" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "password" TEXT NOT NULL;
