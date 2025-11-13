import client from "./client";

export interface CreateWorkoutRequest {
  workoutName: string;
  workoutDate: string;
  exerciseId: string;
}

export interface AddExerciseToWorkoutRequest {
  workoutId: string;
  exerciseId: string;
}

export interface ExerciseDto {
  name: string;
}

export interface Workout {
  exerciseId: string; 
  workoutName: string;
  workoutId: string;
  exercises: ExerciseDto[];
}

export async function createNewWorkout(
  request: CreateWorkoutRequest
): Promise<string> {
  const response = await client.post<string>(
    "/create-workout",
    request
  );
  return response.data;
}

export async function addExerciseToWorkout(
  request: AddExerciseToWorkoutRequest
): Promise<string> {
  const response = await client.post<string>(
    "/add-exercise-to-workout",
    request
  );
  return response.data;
}

export async function getWorkout(workoutId: string): Promise<Workout> {
  const response = await client.get<Workout>(
    `/get-workout?workoutId=${workoutId}`
  );
  return response.data;
}

