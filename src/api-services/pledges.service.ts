import { endpoints, api } from "./http";

import type {
  PledgeExtended,
  PaymentSchedule,
  CreatePledgeDto,
  UpdatePledgeDto,
  CreateScheduleItemDto,
  UpdateScheduleItemDto,
} from "@repo/database";

/* -------------------------------------------------------------------------- */
/*                                   Pledges                                  */
/* -------------------------------------------------------------------------- */

export type GetPledgesParams = {
  projectId?: string;
  donorId?: string;
};

/**
 * Get all pledges.
 * Can be filtered by projectId or donorId.
 */
export const getAllPledges = (
  params?: GetPledgesParams,
): Promise<PledgeExtended[]> =>
  api.get<PledgeExtended[]>(endpoints.pledges, params);

/**
 * Get pledge by id.
 */
export const getPledgeById = (id: string): Promise<PledgeExtended> =>
  api.get<PledgeExtended>(`${endpoints.pledges}/${id}`);

/**
 * Create a new pledge.
 */
export const createPledge = (data: CreatePledgeDto): Promise<PledgeExtended> =>
  api.post<PledgeExtended>(endpoints.pledges, data);

/**
 * Update an existing pledge.
 */
export const updatePledge = (
  id: string,
  data: UpdatePledgeDto,
): Promise<PledgeExtended> =>
  api.patch<PledgeExtended>(`${endpoints.pledges}/${id}`, data);

/**
 * Delete pledge by id.
 */
export const deletePledgeById = (id: string): Promise<PledgeExtended> =>
  api.delete<PledgeExtended>(`${endpoints.pledges}/${id}`);

/* -------------------------------------------------------------------------- */
/*                             Payment Schedule                               */
/* -------------------------------------------------------------------------- */

/**
 * Create a new payment schedule item for a pledge.
 */
export const createPledgeScheduleItem = (
  pledgeId: string,
  data: Omit<CreateScheduleItemDto, "pledgeId">,
): Promise<PaymentSchedule> =>
  api.post<PaymentSchedule>(`${endpoints.pledges}/${pledgeId}/schedule`, data);

/**
 * Update an existing payment schedule item.
 */
export const updatePledgeScheduleItem = (
  itemId: string,
  data: UpdateScheduleItemDto,
): Promise<PaymentSchedule> =>
  api.patch<PaymentSchedule>(`${endpoints.pledges}/schedule/${itemId}`, data);

/**
 * Delete payment schedule item by id.
 */
export const deletePledgeScheduleItemById = (
  itemId: string,
): Promise<PaymentSchedule> =>
  api.delete<PaymentSchedule>(`${endpoints.pledges}/schedule/${itemId}`);

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/**
 * Get payment schedule for a pledge.
 * Usually included in getPledgeById, but exposed for convenience.
 */
export const getPledgeScheduleByPledgeId = (
  pledgeId: string,
): Promise<PaymentSchedule[]> =>
  getPledgeById(pledgeId).then((pledge) => pledge.schedule ?? []);
