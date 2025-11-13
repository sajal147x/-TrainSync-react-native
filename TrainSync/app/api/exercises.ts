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

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

export async function getExercises(
  params?: GetExercisesParams
): Promise<ExerciseDto[]> {
  const response = await client.get<PageResponse<ExerciseDto>>("/exercises", {
    params,
  });
  return response.data.content;
}

export async function getMuscleTags(): Promise<string[]> {
  const response = await client.get<string[]>("/exercises/muscletags");
  return response.data;
}

