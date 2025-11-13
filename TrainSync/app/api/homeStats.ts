import client from "./client";

export async function getLoggedWorkouts(): Promise<number> {
  const response = await client.get("/homeStats/loggedWorkouts");
  return response.data;
}

