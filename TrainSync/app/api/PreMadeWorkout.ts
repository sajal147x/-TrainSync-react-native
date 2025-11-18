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

export interface AddExerciseToPreMadeWorkoutRequest {
  preMadeWorkoutId: string;
  exerciseId: string;
  equipmentId: string;
}

/**
 * Adds an exercise to an existing pre-made workout.
 */
export async function addExerciseToPreMadeWorkout(
  request: AddExerciseToPreMadeWorkoutRequest
): Promise<void> {
  await client.post("/add-exercise-to-premade-workout", request);
}

export interface AddSetToPreMadeWorkoutRequest {
  exerciseId: string;
  setNumber: number;
}

export interface SetDtoForDelete {
  id: string;
  setNumber: number;
}

export interface PreMadeWorkoutSetDto {
  id: string;
  setNumber: number;
}

export interface DeleteSetFromPreMadeWorkoutRequest {
  deletedSetId: string;
  newSets: SetDtoForDelete[];
}

/**
 * Adds a set to an exercise in a pre-made workout.
 */
export async function addSetToPreMadeWorkout(
  request: AddSetToPreMadeWorkoutRequest
): Promise<string> {
  const response = await client.post<string>(
    "/add-set-to-pre-made-workout",
    request
  );
  return response.data;
}

/**
 * Deletes a set from an exercise in a pre-made workout.
 */
export async function deleteSetFromPreMadeWorkout(
  request: DeleteSetFromPreMadeWorkoutRequest
): Promise<void> {
  await client.post("/delete-set-from-pre-made-workout", request);
}

/**
 * Fetches all sets for a pre-made workout exercise.
 */
export async function getPreMadeWorkoutSets(
  preMadeWorkoutExerciseId: string
): Promise<PreMadeWorkoutSetDto[]> {
  const response = await client.get<PreMadeWorkoutSetDto[]>(
    `/getPreMadeWorkoutSets?preMadeWorkoutExerciseId=${preMadeWorkoutExerciseId}`
  );
  return response.data;
}

