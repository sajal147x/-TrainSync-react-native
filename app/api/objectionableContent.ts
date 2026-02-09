import client from "./client";

export interface FlagContentRequest {
  groupId: string;
  text: string;
}

export async function flagContent(request: FlagContentRequest): Promise<void> {
  await client.post("/flag-content", {
    groupId: request.groupId,
    text: request.text,
  });
}
