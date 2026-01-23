import client from "../client";

export interface ResetPasswordRequest {
  userNameOrEmail: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const resetPassword = (userNameOrEmail: string) =>
  client.post<ResetPasswordResponse>("/reset-password", { userNameOrEmail }, {
    validateStatus: (status) => status < 500, // Don't throw for 4xx errors, handle them manually
  });
