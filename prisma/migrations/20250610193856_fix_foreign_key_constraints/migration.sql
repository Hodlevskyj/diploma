-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_userId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteExercise" DROP CONSTRAINT "FavoriteExercise_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteExercise" DROP CONSTRAINT "FavoriteExercise_userId_fkey";

-- DropForeignKey
ALTER TABLE "FavoritePlan" DROP CONSTRAINT "FavoritePlan_userId_fkey";

-- DropForeignKey
ALTER TABLE "TrackedExercise" DROP CONSTRAINT "TrackedExercise_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutPlanCompletion" DROP CONSTRAINT "WorkoutPlanCompletion_userId_fkey";

-- AddForeignKey
ALTER TABLE "TrackedExercise" ADD CONSTRAINT "TrackedExercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanCompletion" ADD CONSTRAINT "WorkoutPlanCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteExercise" ADD CONSTRAINT "FavoriteExercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteExercise" ADD CONSTRAINT "FavoriteExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritePlan" ADD CONSTRAINT "FavoritePlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
