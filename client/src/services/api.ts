import type {
  CreateCustomerInput,
  Customer,
  CustomerSummary,
  HealthStatus,
  Mockup,
} from "../types";

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export function publicUrl(path: string) {
  return path.startsWith("/") ? `${apiBaseUrl}${path}` : path;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(publicUrl(url), init);
  } catch {
    throw new Error("The server is unavailable. Check that the app is running and try again.");
  }

  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data as T;
}

export const api = {
  listCustomers: async () => {
    const customers = await request<unknown>("/api/customers");
    if (!Array.isArray(customers)) {
      throw new Error(
        "The API returned an unexpected response. Check that the Monster Pro Wash backend is running on the configured port.",
      );
    }
    return customers as CustomerSummary[];
  },
  getCustomer: (customerId: string) =>
    request<Customer>(`/api/customers/${customerId}`),
  createCustomer: (input: CreateCustomerInput) =>
    request<Customer>("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  createMockup: (
    customerId: string,
    input: { original: File; reference: File; instructions: string },
  ) => {
    const body = new FormData();
    body.append("original", input.original);
    body.append("reference", input.reference);
    body.append("instructions", input.instructions);
    return request<Mockup>(`/api/customers/${customerId}/mockups`, {
      method: "POST",
      body,
    });
  },
  health: () => request<HealthStatus>("/api/health"),
};
