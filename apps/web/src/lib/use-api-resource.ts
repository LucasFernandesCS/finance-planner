import { useCallback, useEffect, useState } from "react";

import { ApiError, apiRequest } from "./api";

type ResourceState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
};

export function useApiResource<T>(loader: () => Promise<T>, dependencies: ReadonlyArray<unknown> = []): ResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    loader()
      .then((result) => {
        if (active) {
          setData(result);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof ApiError ? err.message : "Nao foi possivel carregar os dados.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [version, ...dependencies]);

  return { data, error, loading, reload };
}

export function useMe() {
  return useApiResource(() => apiRequest<import("./types").UserProfile>("/me"), []);
}
