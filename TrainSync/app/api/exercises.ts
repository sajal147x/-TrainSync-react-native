import client from "./client";

export interface MuscleTagDto {
  id: string;
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
  equipmentTag?: EquipmentTagDto;
  exercisePictureUrl?: string;
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

export interface CreateExerciseRequest {
  name: string;
  equipmentIds: string[];
  muscleTagIdsPrimary: string[];
  muscleTagIdsSecondary: string[];
}

export interface EditExerciseRequest {
  exerciseId: string;
  name: string;
  equipmentIds: string[];
  muscleTagIdsPrimary: string[];
  muscleTagIdsSecondary: string[];
  exercisePictureBase64?: string | null;
}

export async function createExercise(
  payload: CreateExerciseRequest
): Promise<ExerciseDto> {
  const response = await client.post<ExerciseDto>("/create-exercise", payload);
  return response.data;
}

export async function editExercise(
  payload: EditExerciseRequest
): Promise<ExerciseDto> {
  const response = await client.put<ExerciseDto>("/edit-exercise", payload);
  return response.data;
}

export async function getExercises(
  params?: GetExercisesParams
): Promise<PageResponse<ExerciseDto>> {
  const response = await client.get<PageResponse<any>>("/exercises", {
    params,
  });

  // Transform the response to ensure tags are normalized
  const normalizedExercises = response.data.content.map((exercise: any) => {
    const equipmentTag = exercise.equipmentTag || exercise.equipment_tag;
    const muscleTags = exercise.muscleTags || exercise.muscle_tags || [];
    const exercisePictureUrl = exercise.exercisePictureUrl || exercise.exercise_picture_url;

    return {
      id: exercise.id,
      name: exercise.name,
      muscleTags: Array.isArray(muscleTags)
        ? muscleTags.map((tag: any) => ({
            id: tag.id ?? tag.name,
            name: tag.name,
            level: tag.level,
          }))
        : [],
      ...(equipmentTag && {
        equipmentTag: {
          id: equipmentTag.id,
          name: equipmentTag.name,
        },
      }),
      ...(exercisePictureUrl && {
        exercisePictureUrl: exercisePictureUrl,
      }),
    };
  });

  return {
    ...response.data,
    content: normalizedExercises,
  };
}

export async function getMuscleTags(): Promise<MuscleTagDto[]> {
  const response = await client.get<MuscleTagDto[]>("/exercises/muscletags");
  return response.data;
}

export async function getEquipmentTags(): Promise<EquipmentTagDto[]> {
  const response = await client.get<EquipmentTagDto[]>("/exercises/equipmenttags");
  return response.data;
}

