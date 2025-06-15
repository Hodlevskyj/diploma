/*
  Warnings:

  - The `status` column on the `WorkoutPlan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `fitnessGoal` column on the `WorkoutPlan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `WorkoutPlanSchedule` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `workoutDayId` on table `WorkoutPlanExercise` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "WorkoutPlanExercise" DROP CONSTRAINT "WorkoutPlanExercise_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutPlanExercise" DROP CONSTRAINT "WorkoutPlanExercise_workoutDayId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutPlanSchedule" DROP CONSTRAINT "WorkoutPlanSchedule_workoutPlanId_fkey";

-- AlterTable
ALTER TABLE "WorkoutDay" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduledDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WorkoutPlan" ADD COLUMN     "difficultyLevel" TEXT,
ADD COLUMN     "equipmentType" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
DROP COLUMN "fitnessGoal",
ADD COLUMN     "fitnessGoal" TEXT;

-- AlterTable
ALTER TABLE "WorkoutPlanExercise" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "videoUrl" TEXT,
ALTER COLUMN "duration" DROP DEFAULT,
ALTER COLUMN "reps" DROP DEFAULT,
ALTER COLUMN "restDuration" DROP DEFAULT,
ALTER COLUMN "workoutDayId" SET NOT NULL;

-- DropTable
DROP TABLE "WorkoutPlanSchedule";

-- CreateIndex
CREATE INDEX "WorkoutDay_workoutPlanId_idx" ON "WorkoutDay"("workoutPlanId");

-- CreateIndex
CREATE INDEX "WorkoutPlan_userId_idx" ON "WorkoutPlan"("userId");

-- CreateIndex
CREATE INDEX "WorkoutPlanExercise_workoutPlanId_idx" ON "WorkoutPlanExercise"("workoutPlanId");

-- CreateIndex
CREATE INDEX "WorkoutPlanExercise_workoutDayId_idx" ON "WorkoutPlanExercise"("workoutDayId");

-- CreateIndex
CREATE INDEX "WorkoutPlanExercise_exerciseId_idx" ON "WorkoutPlanExercise"("exerciseId");

-- AddForeignKey
ALTER TABLE "WorkoutPlanExercise" ADD CONSTRAINT "WorkoutPlanExercise_workoutDayId_fkey" FOREIGN KEY ("workoutDayId") REFERENCES "WorkoutDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanExercise" ADD CONSTRAINT "WorkoutPlanExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
