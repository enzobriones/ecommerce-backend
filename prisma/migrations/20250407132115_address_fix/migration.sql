/*
  Warnings:

  - Added the required column `region` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "region" TEXT NOT NULL;
