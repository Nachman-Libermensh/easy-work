import { api, endpoints } from "./http";

export type KupaItem = {
  id: string;
  uniqueId: string;
  type: "INCOME" | "EXPENSE";
  date: string; // Dates over JSON are strings
  creditAmount: number | null;
  debitAmount: number | null;
  project: string | null;
  description: string | null;
  entityName: string | null;
  originalData: any;
};

export const getKupaHistory = (): Promise<KupaItem[]> =>
  api.get<KupaItem[]>(`${endpoints.reports}/kupa-history`);
