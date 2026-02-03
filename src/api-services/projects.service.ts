import { endpoints, api } from "./http";

import type {
  ProjectExtended,
  Currency,
  ProjectStatus,
  Donation,
  Expense,
  Donor,
  Pledge,
  CreateProjectDto,
  UpdateProjectDto,
} from "@repo/database";

/* -------------------------------------------------------------------------- */
/*                                   Projects                                 */
/* -------------------------------------------------------------------------- */

export const getAllProjects = (): Promise<ProjectExtended[]> =>
  api.get<ProjectExtended[]>(endpoints.projects);

export const getProjectById = (id: string): Promise<ProjectExtended> =>
  api.get<ProjectExtended>(`${endpoints.projects}/${id}`);

export const createProject = (
  data: CreateProjectDto,
): Promise<ProjectExtended> =>
  api.post<ProjectExtended>(endpoints.projects, data);

export const updateProject = (
  id: string,
  data: UpdateProjectDto & { status?: ProjectStatus },
): Promise<ProjectExtended> =>
  api.patch<ProjectExtended>(`${endpoints.projects}/${id}`, data);

export const deleteProjectById = (id: string): Promise<ProjectExtended> =>
  api.delete<ProjectExtended>(`${endpoints.projects}/${id}`);

/* -------------------------------------------------------------------------- */
/*                              Project – Extras                              */
/* -------------------------------------------------------------------------- */

export const getProjectStats = (id: string): Promise<any> =>
  api.get<any>(`${endpoints.projects}/${id}/stats`);

export const getProjectPledges = (projectId: string): Promise<Pledge[]> =>
  api.get<Pledge[]>(endpoints.pledges, { projectId });

export const getProjectDonations = (
  projectId: string,
): Promise<Donation[]> =>
  api.get<Donation[]>(endpoints.donations, { projectId });

export const getProjectExpenses = (projectId: string): Promise<Expense[]> =>
  api.get<Expense[]>(endpoints.expenses, { projectId });

export const getProjectDonors = (projectId: string): Promise<Donor[]> =>
  api.get<Donor[]>(endpoints.donors, { projectId });

/* -------------------------------------------------------------------------- */
/*                                System Data                                 */
/* -------------------------------------------------------------------------- */

export const getAllCurrencies = (): Promise<Currency[]> =>
  api.get<Currency[]>(endpoints.currencies);

/* -------------------------------------------------------------------------- */
/*                               Quick / Minimal                              */
/* -------------------------------------------------------------------------- */

export type QuickListProject = Pick<
  ProjectExtended,
  "id" | "name" | "color" | "description"
>;

export const getQuickListProjects = (): Promise<QuickListProject[]> =>
  api.get<QuickListProject[]>(endpoints.projects);
