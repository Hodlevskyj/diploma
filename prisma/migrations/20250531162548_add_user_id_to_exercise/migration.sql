-- First, add the column as nullable
ALTER TABLE "Exercise" ADD COLUMN "userId" INTEGER;

-- Assuming we want to assign existing exercises to user with ID 1 (or another default user)
UPDATE "Exercise" SET "userId" = 1 WHERE "userId" IS NULL;

-- Make the column required after setting default values
ALTER TABLE "Exercise" ALTER COLUMN "userId" SET NOT NULL;

-- Add the foreign key constraint with proper deletion behavior
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_userId_fkey" 
    FOREIGN KEY ("userId") 
    REFERENCES "User"("id") 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE;

-- Add an index for better query performance
CREATE INDEX "Exercise_userId_idx" ON "Exercise"("userId");