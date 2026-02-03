import { endpoints, api } from "./http";

import type { DonorExtended, CreateDonorDto } from "@repo/database";

/* -------------------------------------------------------------------------- */
/*                                   Donors                                   */
/* -------------------------------------------------------------------------- */

/**
 * Get all donors.
 * Optionally filter by projectId.
 */
export const getAllDonors = (projectId?: string): Promise<DonorExtended[]> =>
  api.get<DonorExtended[]>(
    endpoints.donors,
    projectId ? { projectId } : undefined,
  );

/**
 * Get donor by id.
 */
export const getDonorById = (id: string): Promise<DonorExtended> =>
  api.get<DonorExtended>(`${endpoints.donors}/${id}`);

/**
 * Create a new donor.
 */
export const createDonor = (data: CreateDonorDto): Promise<DonorExtended> =>
  api.post<DonorExtended>(endpoints.donors, data);

/**
 * Update an existing donor.
 */
export const updateDonor = (
  id: string,
  data: Partial<CreateDonorDto>,
): Promise<DonorExtended> =>
  api.patch<DonorExtended>(`${endpoints.donors}/${id}`, data);

/**
 * Delete donor by id.
 */
export const deleteDonorById = (id: string): Promise<DonorExtended> =>
  api.delete<DonorExtended>(`${endpoints.donors}/${id}`);
