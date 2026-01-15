import client from "../client";

export interface WorkoutDto {
  workoutId: string;
  workoutName: string;
  workoutDate: string;
}

export interface FriendWorkoutSummaryDto {
  workoutCountThisWeek: number;
  recentWorkouts: WorkoutDto[];
}

export async function getFriendWorkoutSummary(friendUserId: string): Promise<FriendWorkoutSummaryDto> {
  const response = await client.get(`/community/friend-workout-summary`, {
    params: { friendUserId }
  });
  return response.data as FriendWorkoutSummaryDto;
}

