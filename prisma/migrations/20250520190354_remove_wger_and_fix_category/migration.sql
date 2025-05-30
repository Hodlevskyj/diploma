/*
  Warnings:

  - You are about to drop the column `category` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `wgerId` on the `Exercise` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Exercise_wgerId_key";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "category",
DROP COLUMN "wgerId",
ALTER COLUMN "intensity" SET DATA TYPE TEXT;
