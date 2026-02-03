import { api, endpoints } from "./http";
import type {
  DonationExtended,
  PaymentMethod,
  CreateDonationDto,
  UpdateDonationDto,
} from "@repo/database";

export const getAllDonations = (params?: {
  projectId?: string;
  donorId?: string;
  pledgeId?: string;
}): Promise<DonationExtended[]> =>
  api.get<DonationExtended[]>(endpoints.donations, params);

export const getDonationById = (id: string): Promise<DonationExtended> =>
  api.get<DonationExtended>(`${endpoints.donations}/${id}`);

export const createDonation = (
  data: CreateDonationDto,
): Promise<DonationExtended> =>
  api.post<DonationExtended>(endpoints.donations, data);

export const updateDonation = (
  id: string,
  data: UpdateDonationDto,
): Promise<DonationExtended> =>
  api.patch<DonationExtended>(`${endpoints.donations}/${id}`, data);

export const deleteDonationById = (id: string): Promise<DonationExtended> =>
  api.delete<DonationExtended>(`${endpoints.donations}/${id}`);

// רשימת אמצעי תשלום
export const getAllPaymentMethods = (): Promise<PaymentMethod[]> =>
  api.get<PaymentMethod[]>(`${endpoints.donations}/payment-methods`);
