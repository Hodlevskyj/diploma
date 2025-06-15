/*
  Warnings:

  - Changed the type of `type` on the `WorkoutPlanExercise` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "WorkoutPlanExercise" DROP COLUMN "type",
ADD COLUMN     "type" "ExerciseType" NOT NULL;
