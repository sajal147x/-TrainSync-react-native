import client from "./client";

export interface RecentWorkoutDto {
  workoutId: string;
  workoutName: string;
  workoutDate: string;
}

export async function getRecentWorkouts(): Promise<RecentWorkoutDto[]> {
  const response = await client.get<RecentWorkoutDto[]>("/get-recent-workouts");
  return response.data;
}

