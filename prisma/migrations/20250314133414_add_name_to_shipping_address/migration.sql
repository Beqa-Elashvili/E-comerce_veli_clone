/*
  Warnings:

  - Added the required column `name` to the `ShippingAddress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ShippingAddress" ADD COLUMN     "name" TEXT NOT NULL;
