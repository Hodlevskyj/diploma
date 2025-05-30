/*
  Warnings:

  - The `fitnessGoal` column on the `WorkoutPlan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `WorkoutCompletion` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('REPS', 'TIME');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "WorkoutCompletion" DROP CONSTRAINT "WorkoutCompletion_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutCompletion" DROP CONSTRAINT "WorkoutCompletion_userId_fkey";

-- AlterTable
ALTER TABLE "TrackedExercise" ADD COLUMN     "workoutPlanId" INTEGER;

-- AlterTable
ALTER TABLE "WorkoutPlan" ADD COLUMN     "description" TEXT,
ADD COLUMN     "status" "PlanStatus" NOT NULL DEFAULT 'IN_PROGRESS',
DROP COLUMN "fitnessGoal",
ADD COLUMN     "fitnessGoal" "GoalType";

-- AlterTable
ALTER TABLE "WorkoutPlanExercise" ADD COLUMN     "duration" INTEGER DEFAULT 0,
ADD COLUMN     "reps" INTEGER DEFAULT 0,
ADD COLUMN     "restDuration" INTEGER DEFAULT 0;

-- DropTable
DROP TABLE "WorkoutCompletion";

-- CreateTable
CREATE TABLE "WorkoutPlanCompletion" (
    "id" SERIAL NOT NULL,
    "workoutPlanId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exerciseId" INTEGER,

    CONSTRAINT "WorkoutPlanCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlanSchedule" (
    "id" SERIAL NOT NULL,
    "workoutPlanId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlanSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrackedExercise" ADD CONSTRAINT "TrackedExercise_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanCompletion" ADD CONSTRAINT "WorkoutPlanCompletion_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanCompletion" ADD CONSTRAINT "WorkoutPlanCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanCompletion" ADD CONSTRAINT "WorkoutPlanCompletion_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanSchedule" ADD CONSTRAINT "WorkoutPlanSchedule_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
