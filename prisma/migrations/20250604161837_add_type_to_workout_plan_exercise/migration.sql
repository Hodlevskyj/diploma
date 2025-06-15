-- 1. Додаємо колонку як nullable
ALTER TABLE "WorkoutPlanExercise" ADD COLUMN "type" TEXT;

-- 2. Заповнюємо значення
UPDATE "WorkoutPlanExercise" 
SET "type" = CASE 
    WHEN "duration" > 0 THEN 'time'
    ELSE 'reps'
END;

-- 3. Робимо колонку NOT NULL
ALTER TABLE "WorkoutPlanExercise" ALTER COLUMN "type" SET NOT NULL;