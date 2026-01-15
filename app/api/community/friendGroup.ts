import client from "../client";

export interface FriendGroupCreateDto {
  groupName: string;
  memberIds: string[];
}

export interface FriendGroupSummaryDto {
  groupId: string;
  groupName: string;
  profilePictureUrl: string;
}

export interface GroupLeaderboardDto {
  userId: string;
  name: string;
  workoutsThisWeek: number;
  profilePictureUrl: string;
}

export async function createGroup(dto: FriendGroupCreateDto): Promise<string> {
  const response = await client.post("/create-group", dto);
  return response.data as string;
}

export async function getGroupsForUser(): Promise<FriendGroupSummaryDto[]> {
  const response = await client.get("/get-groups-for-user");
  return response.data as FriendGroupSummaryDto[];
}

export async function getGroupLeaderboard(groupId: string, timeFrame: 'week' | 'month' | 'year'): Promise<GroupLeaderboardDto[]> {
  const response = await client.post("/group-leaderboard", { groupId, timeFrame });
  return response.data as GroupLeaderboardDto[];
}

