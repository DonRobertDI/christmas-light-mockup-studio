import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { z } from "zod";
import { database } from "../db/database.js";

const createCustomerSchema = z.object({
  name: z.string().trim().min(2, "Customer name is required.").max(120),
  address: z.string().trim().min(5, "A complete customer address is required.").max(240),
});

interface CustomerRow {
  id: string;
  name: string;
  address: string;
  created_at: string;
  mockup_count?: number;
  latest_mockup_path?: string | null;
}

interface MockupRow {
  id: string;
  customer_id: string;
  original_image_path: string;
  reference_image_path: string;
  generated_image_path: string;
  prompt: string;
  created_at: string;
}

const mapCustomer = (row: CustomerRow) => ({
  id: row.id,
  name: row.name,
  address: row.address,
  createdAt: row.created_at,
  ...(row.mockup_count !== undefined && { mockupCount: row.mockup_count }),
  ...(row.latest_mockup_path !== undefined && {
    latestMockupPath: row.latest_mockup_path,
  }),
});

const mapMockup = (row: MockupRow) => ({
  id: row.id,
  customerId: row.customer_id,
  originalImagePath: row.original_image_path,
  referenceImagePath: row.reference_image_path,
  generatedMockupImagePath: row.generated_image_path,
  prompt: row.prompt,
  createdAt: row.created_at,
});

export function listCustomers(_request: Request, response: Response) {
  const rows = database
    .prepare(
      `SELECT
        c.id,
        c.name,
        c.address,
        c.created_at,
        COUNT(m.id) AS mockup_count,
        (
          SELECT generated_image_path
          FROM mockups latest
          WHERE latest.customer_id = c.id
          ORDER BY latest.created_at DESC
          LIMIT 1
        ) AS latest_mockup_path
      FROM customers c
      LEFT JOIN mockups m ON m.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC`,
    )
    .all() as CustomerRow[];

  response.json(rows.map(mapCustomer));
}

export function createCustomer(request: Request, response: Response) {
  const parsed = createCustomerSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      message: parsed.error.issues[0]?.message ?? "Please check the customer details.",
    });
    return;
  }

  const customer = {
    id: randomUUID(),
    name: parsed.data.name,
    address: parsed.data.address,
    createdAt: new Date().toISOString(),
  };

  database
    .prepare(
      "INSERT INTO customers (id, name, address, created_at) VALUES (?, ?, ?, ?)",
    )
    .run(customer.id, customer.name, customer.address, customer.createdAt);

  response.status(201).json(customer);
}

export function getCustomer(request: Request, response: Response) {
  const customer = database
    .prepare("SELECT * FROM customers WHERE id = ?")
    .get(request.params.id) as CustomerRow | undefined;

  if (!customer) {
    response.status(404).json({ message: "Customer not found." });
    return;
  }

  const mockups = database
    .prepare(
      "SELECT * FROM mockups WHERE customer_id = ? ORDER BY created_at DESC",
    )
    .all(customer.id) as MockupRow[];

  response.json({
    ...mapCustomer(customer),
    mockups: mockups.map(mapMockup),
  });
}
