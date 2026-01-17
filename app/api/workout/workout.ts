import client from "../client";

export interface CreateWorkoutRequest {
  workoutName: string;
  workoutDate: string;
  exerciseId: string;
  equipmentId: string;
}

export interface AddExerciseToWorkoutRequest {
  workoutId: string;
  exerciseId: string;
  equipmentId: string;
  exerciseOrder: number;
}

export interface SetDto {
  id: string;
  weight: number;
  reps: number;
  setNumber: number;
}

export interface ExerciseDto {
  id: string;
  name: string;
  sets: SetDto[];
  preFilledFlag?: string;
  preFilledDate?: string;
  preFilledWorkoutName?: string;
  exercisePictureUrl?: string;
  exerciseOrder?: number;
  exerciseLibraryId?: string;
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

export interface AddSetToExerciseRequest {
  exerciseId: string;
  weight: string;
  reps: string;
  setNumber: number;
}

export interface UpdateSetInExerciseRequest {
  setId: string;
  weight: string;
  reps: string;
}

export async function addSetToExercise(
  request: AddSetToExerciseRequest
): Promise<string> {
  
  const response = await client.post<string>(
    "/add-set-to-exercise",
    request
  );
  
  console.log('addSetToExercise response:', response.data);
  return response.data;
}

export async function updateSetInExercise(
  request: UpdateSetInExerciseRequest
): Promise<void> {
  await client.post(
    "/update-set-in-exercise",
    request
  );
}

export interface SetDtoForDelete {
  id: string;
  setNumber: number;
}

export interface DeleteSetRequest {
  deletedSetId: string;
  newSets: SetDtoForDelete[];
}

export async function deleteSet(
  request: DeleteSetRequest
): Promise<void> {
  await client.post(
    "/delete-set",
    request
  );
}

export async function getSets(exerciseId: string): Promise<ExerciseDto> {
  const response = await client.get<ExerciseDto>(
    `/get-sets?exerciseId=${exerciseId}`
  );
  console.log('getSets response:', response.data);
  return response.data;
}

export interface ChangeExerciseInWorkoutRequest {
  exerciseId: string; // Current workout exercise ID
  newExerciseLibraryId: string; // New exercise library ID
  workoutId: string; // Workout ID
}

export async function changeExerciseInWorkout(
  request: ChangeExerciseInWorkoutRequest
): Promise<void> {
  await client.post(
    "/change-exercise-in-workout",
    request
  );
}

export interface DeleteExerciseInWorkoutRequest {
  exerciseId: string;
}

export async function deleteExerciseInWorkout(
  request: DeleteExerciseInWorkoutRequest
): Promise<void> {
  await client.post(
    "/delete-exercise-in-workout",
    request
  );
}

export interface DeleteWorkoutRequest {
  workoutId: string;
}

export async function deleteWorkout(
  request: DeleteWorkoutRequest
): Promise<void> {
  await client.post(
    "/delete-workout",
    request
  );
}

