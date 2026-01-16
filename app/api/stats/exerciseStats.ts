import client from "../client";

export interface SetDto {
  id: string;
  weight: number;
  reps: number;
  setNumber: number;
}

export interface ExerciseStatsDto {
  totalCount: number;
  averageNumberOfSets: number;
  maxWeight: number;
  repsForMaxWeight: number;
  recommendedSets: SetDto[];
}

export interface GetExerciseStatsRequest {
  exerciseLibraryId: string;
}

export async function getExerciseStats(exerciseLibraryId: string): Promise<ExerciseStatsDto> {
  const response = await client.post<ExerciseStatsDto>("/exercise-stats", {
    exerciseLibraryId: exerciseLibraryId,
  });
  return response.data;
}

