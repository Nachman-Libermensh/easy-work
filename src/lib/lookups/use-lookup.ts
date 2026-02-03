import { useQuery } from "@tanstack/react-query";
import { lookupRegistry, LookupKey } from "./index";
import { useMemo } from "react";

export interface LookupOption {
  value: string; // Select values are always strings in HTML
  label: string;
  original: any;
}

type InferLookupData<K extends LookupKey> = Awaited<
  ReturnType<(typeof lookupRegistry)[K]["queryFn"]>
>[number];

export function useLookup<K extends LookupKey>(key: K) {
  const config = lookupRegistry[key];

  const query = useQuery({
    queryKey: config.queryKey,
    queryFn: config.queryFn as () => Promise<any[]>,
    staleTime: 1000 * 60 * 60, // 1 hour cache for system data (static tables)
    refetchOnWindowFocus: false,
  });

  // Map for O(1) access. Keys are converted to string for consistency.
  const map = useMemo(() => {
    const m = new Map<string, any>();
    if (!query.data) return m;

    for (const item of query.data) {
      const id = config.getId(item);
      m.set(String(id), item);
    }
    return m;
  }, [query.data, config]);

  // Options for UI Select components
  const options = useMemo<LookupOption[]>(() => {
    if (!query.data) return [];
    return query.data.map((item) => ({
      value: String(config.getId(item)),
      label: config.getLabel(item),
      original: item,
    }));
  }, [query.data, config]);

  // Helper to fetch full object by ID
  const getById = (id: string | number | null | undefined) => {
    if (id === null || id === undefined) return undefined;
    return map.get(String(id));
  };

  // Helper to fetch just the label
  const getLabel = (id: string | number | null | undefined) => {
    const item = getById(id);
    return item ? config.getLabel(item) : "";
  };

  return {
    ...query,
    data: query.data || [],
    options,
    getById,
    getLabel,
    map,
  };
}
