/*
  Warnings:

  - You are about to alter the column `weight` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - A unique constraint covering the columns `[stravaId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `goal` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stravaAccessToken" TEXT,
ADD COLUMN     "stravaId" INTEGER,
ADD COLUMN     "stravaRefreshToken" TEXT,
ADD COLUMN     "stravaTokenExpires" TIMESTAMP(3),
ALTER COLUMN "weight" SET DATA TYPE INTEGER,
ALTER COLUMN "goal" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_stravaId_key" ON "User"("stravaId");
