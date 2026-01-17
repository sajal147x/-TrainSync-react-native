import client from "../client";

export interface ExerciseStatsDto {
  exerciseStatTimeFrames: ExerciseStatTimeFrameDto[];
}

export interface ExerciseStatTimeFrameDto {
  statValue: number;
  workoutDate: string;
}

export interface GetExerciseStatsRequest {
  exerciseLibraryId: string;
}

export interface ExerciseStatsRequest {
  exerciseLibraryId: string;
  timeFrameMonths: string;
  statType: string;
}

export async function getExerciseStats(exerciseLibraryId: string): Promise<ExerciseStatsDto> {
  const response = await client.post<ExerciseStatsDto>("/exercise-stats", {
    exerciseLibraryId: exerciseLibraryId,
  });
  return response.data;
}

export async function getExerciseStatsWithFilters(
  exerciseLibraryId: string,
  timeFrameMonths: string,
  statType: string
): Promise<ExerciseStatsDto> {
  const response = await client.post<ExerciseStatsDto>("/exercise-stats", {
    exerciseLibraryId: exerciseLibraryId,
    timeFrameMonths: timeFrameMonths,
    statType: statType,
  });
  return response.data;
}

