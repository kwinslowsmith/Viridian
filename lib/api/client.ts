/**
 * API Client for Viridian
 * Handles request/response serialization, error handling, and retry logic
 */

export interface ApiError extends Error {
  status: number;
  data?: unknown;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options?: {
      body?: unknown;
      params?: Record<string, string | number | boolean>;
      retries?: number;
    }
  ): Promise<T> {
    const url = new URL(
      endpoint,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000"
    );

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (options?.body) {
      config.body = JSON.stringify(options.body);
    }

    const retries = options?.retries ?? 3;
    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url.toString(), config);

        if (!response.ok) {
          const error = new Error(
            `API error: ${response.statusText}`
          ) as ApiError;
          error.status = response.status;

          try {
            error.data = await response.json();
          } catch {
            error.data = { message: response.statusText };
          }

          lastError = error;

          // Don't retry 4xx errors (except 429)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw error;
          }

          // Exponential backoff for retries
          if (attempt < retries - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, attempt) * 1000)
            );
          }
          continue;
        }

        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          return await response.json();
        }

        return (await response.text()) as unknown as T;
      } catch (error) {
        if (error instanceof Error) {
          const apiError = new Error(error.message) as ApiError;
          apiError.status = 0;
          apiError.data = null;
          lastError = apiError;
        }

        if (attempt < retries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    if (lastError) {
      throw lastError;
    }

    throw new Error("Unknown error");
  }

  async get<T>(
    endpoint: string,
    options?: { params?: Record<string, string | number | boolean>; retries?: number }
  ): Promise<T> {
    return this.request<T>("GET", endpoint, options);
  }

  async post<T>(
    endpoint: string,
    body: unknown,
    options?: { retries?: number }
  ): Promise<T> {
    return this.request<T>("POST", endpoint, { body, ...options });
  }

  async patch<T>(
    endpoint: string,
    body: unknown,
    options?: { retries?: number }
  ): Promise<T> {
    return this.request<T>("PATCH", endpoint, { body, ...options });
  }

  async put<T>(
    endpoint: string,
    body: unknown,
    options?: { retries?: number }
  ): Promise<T> {
    return this.request<T>("PUT", endpoint, { body, ...options });
  }

  async delete<T>(endpoint: string, options?: { retries?: number }): Promise<T> {
    return this.request<T>("DELETE", endpoint, options);
  }
}

export const apiClient = new ApiClient("/api");

export default apiClient;
