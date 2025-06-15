-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "imageUrl" TEXT;

-- CreateIndex
CREATE INDEX "Exercise_exerciseCategoryId_idx" ON "Exercise"("exerciseCategoryId");
