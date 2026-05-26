"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, ApiError } from "./apiFetch";

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFetch<T>(url: string | null): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const result = await apiFetch<T>(url, { signal: controller.signal });
      if (!mountedRef.current || controller.signal.aborted) return;
      setData(result);
      setLoading(false);
    } catch (err) {
      if (!mountedRef.current || controller.signal.aborted) return;
      if (err instanceof ApiError && err.status === 401) return;
      if (err instanceof DOMException && err.name === "AbortError") return;

      const mensagem = err instanceof Error ? err.message : "Erro de rede";
      setError(mensagem);
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
