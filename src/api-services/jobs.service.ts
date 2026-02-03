import { api, endpoints } from "./http";

export const addJob = (payload: {
  type: string;
  data: unknown;
}): Promise<{ status: string }> =>
  api.post<{ status: string }>(endpoints.jobs, payload);
