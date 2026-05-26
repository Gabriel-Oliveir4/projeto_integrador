const DEFAULT_TIMEOUT_MS = 8000;

export class ApiError extends Error {
  status?: number;
  timeout?: boolean;

  constructor(message: string, opts: { status?: number; timeout?: boolean } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.timeout = opts.timeout;
  }
}

interface ApiFetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
  redirectOn401?: boolean;
}

export async function apiFetch<T = unknown>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    headers,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal: externalSignal,
    redirectOn401 = true,
  } = options;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  const signal = externalSignal
    ? AbortSignal.any([timeoutController.signal, externalSignal])
    : timeoutController.signal;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });

    const data = await res.json().catch(() => null);

    if (res.status === 401 && redirectOn401) {
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new ApiError("Sessão expirada", { status: 401 });
    }

    if (!res.ok) {
      const mensagem =
        data && typeof data === "object" && "erro" in data && typeof data.erro === "string"
          ? data.erro
          : `Erro ${res.status}`;
      throw new ApiError(mensagem, { status: res.status });
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;

    if (err instanceof DOMException && err.name === "AbortError") {
      if (timeoutController.signal.aborted) {
        throw new ApiError("Tempo limite excedido. Verifique sua conexão.", { timeout: true });
      }
      throw err;
    }

    throw new ApiError(err instanceof Error ? err.message : "Erro de rede", {});
  } finally {
    clearTimeout(timeoutId);
  }
}
