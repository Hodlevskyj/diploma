/*
  Warnings:

  - You are about to drop the `FavoritePlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FavoritePlan" DROP CONSTRAINT "FavoritePlan_planId_fkey";

-- DropForeignKey
ALTER TABLE "FavoritePlan" DROP CONSTRAINT "FavoritePlan_userId_fkey";

-- DropTable
DROP TABLE "FavoritePlan";

-- CreateTable
CREATE TABLE "favorite_plans" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorite_plans_userId_planId_key" ON "favorite_plans"("userId", "planId");

-- AddForeignKey
ALTER TABLE "favorite_plans" ADD CONSTRAINT "favorite_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_plans" ADD CONSTRAINT "favorite_plans_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
