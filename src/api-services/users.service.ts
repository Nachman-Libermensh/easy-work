import type { User } from "@repo/database";
import { api, endpoints } from "./http";

export const getAllUsers = (): Promise<User[]> =>
  api.get<User[]>(endpoints.users);

export const getUsersPublicSession = (): Promise<{
  message: string;
  session: unknown;
}> => api.get<{ message: string; session: unknown }>(`${endpoints.users}/public`);

export const getUsersOptionalSession = (): Promise<{
  authenticated: boolean;
  session: unknown;
}> =>
  api.get<{ authenticated: boolean; session: unknown }>(
    `${endpoints.users}/optional`,
  );

export const getUsersAdminMessage = (): Promise<string> =>
  api.get<string>(`${endpoints.users}/admin`);

export const getUsersProtectedMessage = (): Promise<string> =>
  api.get<string>(`${endpoints.users}/protected`);

export const getCurrentUserProfile = (): Promise<{
  session: unknown;
  user: User | null;
}> =>
  api.get<{ session: unknown; user: User | null }>(`${endpoints.users}/me`);
