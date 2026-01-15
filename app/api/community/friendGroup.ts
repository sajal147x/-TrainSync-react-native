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

export interface GroupMemberDto {
  userId: string;
  name: string;
  profilePictureUrl: string;
}

export interface EditGroupDto {
  groupId: string;
  profilePictureBase64?: string | null;
  toRemoveUserIds: string[];
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

export async function getGroupMembers(groupId: string): Promise<GroupMemberDto[]> {
  const response = await client.post("/get-group-members", { groupId });
  return response.data as GroupMemberDto[];
}

export async function editGroup(dto: EditGroupDto): Promise<void> {
  await client.post("/edit-group", dto);
}

