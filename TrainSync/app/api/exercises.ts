import client from "./client";

export interface MuscleTagDto {
  name: string;
  level: string;
}

export interface EquipmentTagDto {
  id: string;
  name: string;
}

export interface ExerciseDto {
  id: string;
  name: string;
  muscleTags: MuscleTagDto[];
  equipmentTags: EquipmentTagDto[];
}

export interface GetExercisesParams {
  searchText?: string;
  muscleTag?: string;
  equipmentTag?: string;
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
  
  // Log raw response to debug equipmentTags issue
  if (response.data.content && response.data.content.length > 0) {
    console.log("🔍 Raw API response sample:", JSON.stringify(response.data.content[0], null, 2));
  }
  
  // Transform the response to ensure equipmentTags is properly mapped
  const exercises = response.data.content.map((exercise: any) => {
    // Handle both camelCase and snake_case field names
    const equipmentTags = exercise.equipmentTags || exercise.equipment_tags || [];
    const muscleTags = exercise.muscleTags || exercise.muscle_tags || [];
    
    return {
      id: exercise.id,
      name: exercise.name,
      muscleTags: Array.isArray(muscleTags) ? muscleTags.map((tag: any) => ({
        name: tag.name,
        level: tag.level,
      })) : [],
      equipmentTags: Array.isArray(equipmentTags) ? equipmentTags.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
      })) : [],
    };
  });
  
  return exercises;
}

export async function getMuscleTags(): Promise<string[]> {
  const response = await client.get<string[]>("/exercises/muscletags");
  return response.data;
}

export async function getEquipmentTags(): Promise<EquipmentTagDto[]> {
  const response = await client.get<EquipmentTagDto[]>("/exercises/equipmenttags");
  return response.data;
}

