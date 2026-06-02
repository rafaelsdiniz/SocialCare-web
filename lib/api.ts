// Cliente HTTP da SocialCare API — chamadas diretas do browser com JWT no header.

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5128";

const TOKEN_KEY = "socialcare.token";
const USER_KEY = "socialcare.usuario";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setSessao(token: string, usuario: unknown): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function limparSessao(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function usuarioArmazenado<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  status: number;
  erros?: Record<string, string[]>;
  constructor(status: number, message: string, erros?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.erros = erros;
  }
}

interface ProblemDetails {
  title?: string;
  detail?: string;
  erro?: string;
  erros?: Record<string, string[]>;
}

interface FetchOpts {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  auth?: boolean; // anexa o token (default: true)
  signal?: AbortSignal;
}

function montarUrl(path: string, query?: FetchOpts["query"]): string {
  const url = new URL(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [chave, valor] of Object.entries(query)) {
      if (valor !== null && valor !== undefined && valor !== "") {
        url.searchParams.set(chave, String(valor));
      }
    }
  }
  return url.toString();
}

export async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { method = "GET", body, query, auth = true, signal } = opts;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let resp: Response;
  try {
    resp = await fetch(montarUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar à API. Verifique se o servidor está no ar.");
  }

  if (resp.status === 401) {
    limparSessao();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login?expirado=1";
    }
    throw new ApiError(401, "Sessão expirada. Faça login novamente.");
  }

  if (resp.status === 204) return undefined as T;

  const texto = await resp.text();
  const dados = texto ? safeJson(texto) : null;

  if (!resp.ok) {
    const p = (dados ?? {}) as ProblemDetails;
    const msg = p.detail || p.erro || p.title || `Erro ${resp.status}.`;
    throw new ApiError(resp.status, msg, p.erros);
  }

  return dados as T;
}

function safeJson(texto: string): unknown {
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}
