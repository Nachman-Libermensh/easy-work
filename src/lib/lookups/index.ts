import { getAllPaymentMethods } from "@/src/api-services/donations.service";
import { getAllProjects } from "@/src/api-services/projects.service";
import {
  getAllCities,
  getAllCurrencies,
} from "@/src/api-services/system-settings.service";
import { getAllUsers } from "@/src/api-services/users.service";
import {
  City,
  Currency,
  PaymentMethod,
  ProjectExtended,
  User,
} from "@repo/database";

export type LookupDefinition<T> = {
  queryKey: string[];
  queryFn: () => Promise<T[]>;
  getId: (item: T) => string | number;
  getLabel: (item: T) => string;
};

export const lookupRegistry = {
  currencies: {
    queryKey: ["lookups", "currencies"],
    queryFn: () => getAllCurrencies(),
    getId: (item) => item.code, // Key is 'code', not 'id'
    getLabel: (item) => `${item.name} (${item.symbol})`,
  } satisfies LookupDefinition<Currency>,

  paymentsMethods: {
    queryKey: ["lookups", "paymentsMethods"],
    queryFn: () => getAllPaymentMethods(),
    getId: (item) => item.id,
    getLabel: (item) => item.name,
  } satisfies LookupDefinition<PaymentMethod>,
  cities: {
    queryKey: ["lookups", "cities"],
    queryFn: () => getAllCities(),
    getId: (item) => item.id,
    getLabel: (item) => item.name,
  } satisfies LookupDefinition<City>,

  projects: {
    queryKey: ["lookups", "projects"],
    queryFn: () => getAllProjects(),

    getId: (item) => item.id,
    getLabel: (item) => item.name,
  } satisfies LookupDefinition<ProjectExtended>,
  users: {
    queryKey: ["lookups", "users"],
    queryFn: () => getAllUsers(),
    getId: (item) => item.id,
    getLabel: (item) => item.name,
  } satisfies LookupDefinition<User>,
} as const;

export type LookupKey = keyof typeof lookupRegistry;
