export interface CustomerSummary {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  mockupCount: number;
  latestMockupPath: string | null;
}

export interface Mockup {
  id: string;
  customerId: string;
  originalImagePath: string;
  referenceImagePath: string;
  generatedMockupImagePath: string;
  prompt: string;
  createdAt: string;
}

export interface Customer extends Omit<CustomerSummary, "mockupCount" | "latestMockupPath"> {
  mockups: Mockup[];
}

export interface CreateCustomerInput {
  name: string;
  address: string;
}

export interface HealthStatus {
  status: "ok";
  aiConfigured: boolean;
}
