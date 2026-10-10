import type { ApiResponse } from "./types";

export const API_BASE_URL =
  "https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api";

export const appAssetUrl = (path: string): string =>
  new URL(
    path.replace(/^\/+/, ""),
    new URL(import.meta.env.BASE_URL, globalThis.location.origin),
  ).href;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface ApiRequestOptions {
  method?: "GET" | "POST";
  signal?: AbortSignal;
  body?: unknown;
}

const getResponseMessage = async (
  response: Response,
  fallback: string,
): Promise<string> => {
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null) {
      if ("message" in body && typeof body.message === "string") {
        return body.message;
      }

      if ("error" in body && typeof body.error === "string") {
        return body.error;
      }
    }
  } catch {
    return fallback;
  }

  return fallback;
};

export const requestApi = async <TData, TMeta = undefined>(
  path: string,
  { method = "GET", signal, body }: ApiRequestOptions = {},
): Promise<ApiResponse<TData, TMeta>> => {
  let response: Response;

  try {
    response = await fetch(new URL(path, `${API_BASE_URL}/`), {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError("Unable to connect to the game server.", 0);
  }

  if (!response.ok) {
    const message: string = await getResponseMessage(
      response,
      `The game server returned an error (${response.status}).`,
    );
    throw new ApiError(message, response.status);
  }

  try {
    return (await response.json()) as ApiResponse<TData, TMeta>;
  } catch {
    throw new ApiError("The game server returned an invalid response.", 502);
  }
};

export const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;
