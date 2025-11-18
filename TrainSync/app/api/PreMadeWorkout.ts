import client from "./client";

export interface CreatePreMadeRoutineRequest {
  name: string;
  exerciseId: string;
  equipmentId: string;
}

export interface PreMadeExerciseDto {
  id: string;
  name: string;
}

export interface PreMadeWorkout {
  id: string;
  name: string;
  exercises: PreMadeExerciseDto[];
}

export interface PreMadeWorkoutListItem {
  id: string;
  name: string;
}

export async function createPreMadeRoutine(
  request: CreatePreMadeRoutineRequest
): Promise<string> {
  const response = await client.post<string>(
    "/createPreMadeRoutine",
    request
  );
  return response.data;
}

/**
 * Fetches a list of all pre-made workouts.
 * Returns a list of workout IDs and names.
 */
export async function getPreMadeWorkouts(): Promise<PreMadeWorkoutListItem[]> {
  const response = await client.get<PreMadeWorkoutListItem[]>(
    "/getPreMadeWorkouts"
  );
  return response.data;
}

/**
 * Fetches a pre-made workout by ID.
 * Matches Java backend: GET /getPreMadeWorkout?preMadeWorkoutId={id}
 * Requires Authorization header (handled by client interceptor)
 */
export async function getPreMadeWorkout(
  preMadeWorkoutId: string
): Promise<PreMadeWorkout> {
  const response = await client.get<PreMadeWorkout>(
    `/getPreMadeWorkout?preMadeWorkoutId=${preMadeWorkoutId}`
  );
  return response.data;
}

