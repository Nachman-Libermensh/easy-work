import { api, endpoints } from "./http";
import type { City, Currency, IncomeSource } from "@repo/database";

// ערים
export const getAllCities = (): Promise<City[]> =>
  api.get<City[]>(endpoints.cities);

export const upsertCity = (data: {
  id?: number;
  name: string;
}): Promise<City> => api.post<City>(endpoints.cities, data);

export const deleteCityById = (id: number): Promise<City> =>
  api.delete<City>(`${endpoints.cities}/${id}`);

// מטבעות
export const getAllCurrencies = (): Promise<Currency[]> =>
  api.get<Currency[]>(endpoints.currencies);

export const upsertCurrency = (
  data: Partial<Currency> & { isNew?: boolean },
): Promise<Currency> => api.post<Currency>(endpoints.currencies, data);

export const deleteCurrencyByCode = (code: string): Promise<Currency> =>
  api.delete<Currency>(`${endpoints.currencies}/${code}`);

// מקורות הכנסה
export const getAllIncomeSources = (): Promise<IncomeSource[]> =>
  api.get<IncomeSource[]>(endpoints.incomeSources);

export const upsertIncomeSource = (data: {
  id?: number;
  name: string;
}): Promise<IncomeSource> =>
  api.post<IncomeSource>(endpoints.incomeSources, data);

export const deleteIncomeSourceById = (id: number): Promise<IncomeSource> =>
  api.delete<IncomeSource>(`${endpoints.incomeSources}/${id}`);
