-- DropForeignKey
ALTER TABLE "WorkoutPlanSchedule" DROP CONSTRAINT "WorkoutPlanSchedule_workoutPlanId_fkey";

-- AddForeignKey
ALTER TABLE "WorkoutPlanSchedule" ADD CONSTRAINT "WorkoutPlanSchedule_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
