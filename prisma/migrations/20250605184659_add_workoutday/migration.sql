-- AlterTable
ALTER TABLE "WorkoutPlanExercise" ADD COLUMN     "workoutDayId" INTEGER;

-- CreateTable
CREATE TABLE "WorkoutDay" (
    "id" SERIAL NOT NULL,
    "workoutPlanId" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "name" TEXT,

    CONSTRAINT "WorkoutDay_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkoutPlanExercise" ADD CONSTRAINT "WorkoutPlanExercise_workoutDayId_fkey" FOREIGN KEY ("workoutDayId") REFERENCES "WorkoutDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutDay" ADD CONSTRAINT "WorkoutDay_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
