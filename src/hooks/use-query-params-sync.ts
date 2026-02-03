import { useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type QueryParamsConfig = Record<string, any>;

export interface UseQueryParamsSyncOptions {
  prefix?: string;
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Hook for bidirectional synchronization with URL query parameters
 * @param state - Current state to sync
 * @param setState - Function to update state
 * @param options - Configuration options
 * @returns Object with utility functions
 */
export function useQueryParamsSync<T extends QueryParamsConfig>(
  state: T,
  setState: (state: T) => void,
  options: UseQueryParamsSyncOptions = {}
) {
  const { prefix = "", enabled = true, debounceMs = 300 } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper to generate prefixed key
  const getPrefixedKey = useCallback(
    (key: string) => (prefix ? `${prefix}_${key}` : key),
    [prefix]
  );

  // Helper to parse value from string
  const parseValue = useCallback((value: string | null): any => {
    if (value === null) return undefined;

    // Try to parse as JSON for complex types
    try {
      return JSON.parse(value);
    } catch {
      // Return as string if not valid JSON
      return value;
    }
  }, []);

  // Helper to serialize value to string
  const serializeValue = useCallback((value: any): string => {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return value;
    return JSON.stringify(value);
  }, []);

  // Read initial state from URL on mount
  useEffect(() => {
    if (!enabled) return;

    const initialState: Partial<T> = {};
    let hasValues = false;

    Object.keys(state).forEach((key) => {
      const prefixedKey = getPrefixedKey(key);
      const paramValue = searchParams.get(prefixedKey);

      if (paramValue !== null) {
        initialState[key as keyof T] = parseValue(paramValue);
        hasValues = true;
      }
    });

    if (hasValues) {
      setState({ ...state, ...initialState });
    }
  }, []); // Only run on mount

  // Sync state to URL
  useEffect(() => {
    if (!enabled) return;

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      let hasChanges = false;

      Object.entries(state).forEach(([key, value]) => {
        const prefixedKey = getPrefixedKey(key);
        const serialized = serializeValue(value);

        if (serialized) {
          if (params.get(prefixedKey) !== serialized) {
            params.set(prefixedKey, serialized);
            hasChanges = true;
          }
        } else {
          if (params.has(prefixedKey)) {
            params.delete(prefixedKey);
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        const newUrl = params.toString()
          ? `${pathname}?${params.toString()}`
          : pathname;
        router.replace(newUrl, { scroll: false });
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [
    state,
    enabled,
    pathname,
    searchParams,
    router,
    debounceMs,
    getPrefixedKey,
    serializeValue,
  ]);

  return {
    getPrefixedKey,
    parseValue,
    serializeValue,
  };
}
