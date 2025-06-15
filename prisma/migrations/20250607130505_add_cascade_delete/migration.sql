-- DropForeignKey
ALTER TABLE "WorkoutPlanExercise" DROP CONSTRAINT "WorkoutPlanExercise_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutPlanExercise" DROP CONSTRAINT "WorkoutPlanExercise_workoutPlanId_fkey";

-- AddForeignKey
ALTER TABLE "WorkoutPlanExercise" ADD CONSTRAINT "WorkoutPlanExercise_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanExercise" ADD CONSTRAINT "WorkoutPlanExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
