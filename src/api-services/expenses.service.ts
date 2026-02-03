import { api, endpoints } from "./http";
import type {
  ExpenseExtended,
  CreateExpenseDto,
  UpdateExpenseDto,
} from "@repo/database";

export const getAllExpenses = (
  projectId?: string,
): Promise<ExpenseExtended[]> =>
  api.get<ExpenseExtended[]>(endpoints.expenses, { projectId });

export const getExpenseById = (id: string): Promise<ExpenseExtended> =>
  api.get<ExpenseExtended>(`${endpoints.expenses}/${id}`);

export const createExpense = (
  data: CreateExpenseDto,
): Promise<ExpenseExtended> =>
  api.post<ExpenseExtended>(endpoints.expenses, data);

export const updateExpense = (
  id: string,
  data: UpdateExpenseDto,
): Promise<ExpenseExtended> =>
  api.patch<ExpenseExtended>(`${endpoints.expenses}/${id}`, data);

export const deleteExpenseById = (id: string): Promise<ExpenseExtended> =>
  api.delete<ExpenseExtended>(`${endpoints.expenses}/${id}`);
