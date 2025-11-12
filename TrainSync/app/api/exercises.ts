import client from "./client";

export interface ExerciseDto {
  id: string;
  name: string;
  muscleTags: string[];
}

export interface GetExercisesParams {
  searchText?: string;
  muscleTag?: string;
  page?: number;
  size?: number;
}

export async function getExercises(
  params?: GetExercisesParams
): Promise<ExerciseDto[]> {
  const response = await client.get("/exercises", {
    params,
  });
  return response.data;
}

