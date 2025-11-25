import client from "./client";

export interface ExerciseProgressionDto {
  date: string;
  tonnage: number;
}

export interface MonthlyExerciseCountPerMuscleDto {
  muscleGroup: string;
  numberOfTimesWorked: number;
  numberOfSets: number;
}

export async function getLoggedWorkouts(): Promise<number> {
  const response = await client.get("/homeStats/loggedWorkouts");
  return response.data;
}

export async function getExerciseProgression(exerciseId: string): Promise<ExerciseProgressionDto[]> {
  const response = await client.get("/homeStats/exerciseProgression", {
    params: {
      exerciseId: exerciseId,
    },
  });
  return response.data;
}

export async function getMonthlyExerciseCountPerMuscle(): Promise<MonthlyExerciseCountPerMuscleDto[]> {
  const response = await client.get("/homeStats/monthlyExerciseCountPerMuscle");
  return response.data;
}

