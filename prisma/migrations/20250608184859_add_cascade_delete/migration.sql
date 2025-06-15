-- DropForeignKey
ALTER TABLE "FavoritePlan" DROP CONSTRAINT "FavoritePlan_planId_fkey";

-- DropForeignKey
ALTER TABLE "TrackedExercise" DROP CONSTRAINT "TrackedExercise_workoutPlanId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutDay" DROP CONSTRAINT "WorkoutDay_workoutPlanId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutPlanCompletion" DROP CONSTRAINT "WorkoutPlanCompletion_workoutPlanId_fkey";

-- AddForeignKey
ALTER TABLE "TrackedExercise" ADD CONSTRAINT "TrackedExercise_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanCompletion" ADD CONSTRAINT "WorkoutPlanCompletion_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutDay" ADD CONSTRAINT "WorkoutDay_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritePlan" ADD CONSTRAINT "FavoritePlan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
