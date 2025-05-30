/*
  Warnings:

  - You are about to drop the column `duration` on the `TrackedExercise` table. All the data in the column will be lost.
  - Added the required column `targetValue` to the `TrackedExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `TrackedExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `TrackedExercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TrackedExercise" DROP COLUMN "duration",
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pauseCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resetCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "targetValue" INTEGER NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "value" INTEGER NOT NULL;
