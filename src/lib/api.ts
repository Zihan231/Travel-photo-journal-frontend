const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export class ApiError extends Error {
  statusCode: number;
  error?: string;

  constructor(message: string, statusCode: number, error?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.error = error;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Set Content-Type only if body is NOT FormData
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (Array.isArray(data?.message) ? data.message.join(", ") : data?.message) ||
      response.statusText ||
      "Something went wrong";
    throw new ApiError(message, response.status, data?.error);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: { name: string; email: string; password: string }) =>
    request<{ message: string; email: string; isEmailVerified: boolean }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(body) }
    ),

  verifyEmail: (body: { email: string; code: string }) =>
    request<{ message: string; email: string; isEmailVerified: boolean }>(
      "/auth/verify-email",
      { method: "POST", body: JSON.stringify(body) }
    ),

  resendCode: (body: { email: string }) =>
    request<{ message: string }>("/auth/resend-code", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<
      | {
          message: string;
          token_type: string;
          access_token: string;
          user: { id: number; name: string; email: string; bio?: string; avatar?: string };
        }
      | {
          requires2fa: true;
          twoFactorToken: string;
          message: string;
        }
    >("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  authenticate2Fa: (body: { twoFactorToken: string; code: string }) =>
    request<{
      message: string;
      token_type: string;
      access_token: string;
      user: { id: number; name: string; email: string; bio?: string; avatar?: string };
    }>("/auth/2fa/authenticate", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getProfile: () =>
    request<{
      message: string;
      user: { id: number; name: string; email: string; bio?: string; avatar?: string };
    }>("/auth/profile"),

  // 2FA Management
  get2FaStatus: () => request<{ isTwoFactorEnabled: boolean }>("/auth/2fa/status"),

  generate2FaSecret: () =>
    request<{
      secret: string;
      qrCodeUrl: string;
      otpauthUrl: string;
      message: string;
    }>("/auth/2fa/generate", { method: "POST" }),

  enable2Fa: (code: string) =>
    request<{
      message: string;
      isTwoFactorEnabled: boolean;
      recoveryCodes: string[];
    }>("/auth/2fa/enable", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  disable2Fa: (code: string, password: string) =>
    request<{
      message: string;
      isTwoFactorEnabled: boolean;
    }>("/auth/2fa/disable", {
      method: "POST",
      body: JSON.stringify({ code, password }),
    }),

  // Photos
  getPhotos: () =>
    request<
      Array<{
        id: number;
        name: string;
        location: string;
        description: string;
        imageUrl: string;
        aiSummary?: string | null;
        createdAt: string;
        updatedAt: string;
      }>
    >("/photos"),

  getPhoto: (id: string | number) =>
    request<{
      id: number;
      name: string;
      location: string;
      description: string;
      imageUrl: string;
      aiSummary?: string | null;
      createdAt: string;
      updatedAt: string;
    }>(`/photos/${id}`),

  uploadPhoto: (formData: FormData) =>
    request<{
      id: number;
      name: string;
      location: string;
      description: string;
      imageUrl: string;
      aiSummary?: string | null;
      createdAt: string;
    }>("/photos", {
      method: "POST",
      body: formData,
    }),

  updatePhoto: (id: string | number, payload: FormData | object) => {
    const isFormData = payload instanceof FormData;
    return request<{
      id: number;
      name: string;
      location: string;
      description: string;
      imageUrl: string;
      aiSummary?: string | null;
      updatedAt: string;
    }>(`/photos/${id}`, {
      method: "PUT",
      body: isFormData ? payload : JSON.stringify(payload),
    });
  },

  deletePhoto: (id: string | number) =>
    request<{ message: string }>(`/photos/${id}`, {
      method: "DELETE",
    }),
};
