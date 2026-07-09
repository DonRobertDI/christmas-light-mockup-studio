import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";

interface SchemaMigrationRow {
  version: number;
  applied_at: string;
}

interface CustomerRow {
  id: string;
  name: string;
  address: string;
  created_at: string;
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

interface DatabaseState {
  schema_migrations: SchemaMigrationRow[];
  customers: CustomerRow[];
  mockups: MockupRow[];
}

interface Statement {
  all: (...params: unknown[]) => unknown[];
  get: (...params: unknown[]) => unknown;
  run: (...params: unknown[]) => void;
}

const emptyState = (): DatabaseState => ({
  schema_migrations: [],
  customers: [],
  mockups: [],
});

function ensureDatabaseFile() {
  fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

  if (!fs.existsSync(config.databasePath)) {
    fs.writeFileSync(
      config.databasePath,
      `${JSON.stringify(emptyState(), null, 2)}\n`,
      "utf8",
    );
  }
}

function readState(): DatabaseState {
  ensureDatabaseFile();

  const raw = fs.readFileSync(config.databasePath, "utf8").trim();
  if (!raw) {
    return emptyState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DatabaseState>;
    return {
      schema_migrations: Array.isArray(parsed.schema_migrations)
        ? parsed.schema_migrations
        : [],
      customers: Array.isArray(parsed.customers) ? parsed.customers : [],
      mockups: Array.isArray(parsed.mockups) ? parsed.mockups : [],
    };
  } catch (error) {
    throw new Error(
      `The database file at ${config.databasePath} is not valid JSON. ` +
        "Set DATABASE_PATH to a writable .json file for this server runtime.",
      { cause: error },
    );
  }
}

function writeState(state: DatabaseState) {
  ensureDatabaseFile();
  fs.writeFileSync(config.databasePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function sortMockupsDescending(mockups: MockupRow[]) {
  return [...mockups].sort((left, right) =>
    right.created_at.localeCompare(left.created_at),
  );
}

function createStatement(sql: string): Statement {
  const normalized = sql.trim().replace(/\s+/g, " ").toLowerCase();

  if (normalized === "select version from schema_migrations") {
    return {
      all: () => readState().schema_migrations,
      get: () => undefined,
      run: () => undefined,
    };
  }

  if (
    normalized ===
    "insert into schema_migrations (version, applied_at) values (?, ?)"
  ) {
    return {
      all: () => [],
      get: () => undefined,
      run: (version, appliedAt) => {
        const state = readState();
        state.schema_migrations.push({
          version: Number(version),
          applied_at: String(appliedAt),
        });
        writeState(state);
      },
    };
  }

  if (normalized.startsWith("select c.id, c.name, c.address, c.created_at,")) {
    return {
      all: () => {
        const state = readState();

        return [...state.customers]
          .sort((left, right) => right.created_at.localeCompare(left.created_at))
          .map((customer) => {
            const mockups = sortMockupsDescending(
              state.mockups.filter((mockup) => mockup.customer_id === customer.id),
            );

            return {
              ...customer,
              mockup_count: mockups.length,
              latest_mockup_path: mockups[0]?.generated_image_path ?? null,
            };
          });
      },
      get: () => undefined,
      run: () => undefined,
    };
  }

  if (
    normalized ===
    "insert into customers (id, name, address, created_at) values (?, ?, ?, ?)"
  ) {
    return {
      all: () => [],
      get: () => undefined,
      run: (id, name, address, createdAt) => {
        const state = readState();
        state.customers.push({
          id: String(id),
          name: String(name),
          address: String(address),
          created_at: String(createdAt),
        });
        writeState(state);
      },
    };
  }

  if (normalized === "select * from customers where id = ?") {
    return {
      all: (id) => {
        const customer = readState().customers.find((row) => row.id === String(id));
        return customer ? [customer] : [];
      },
      get: (id) =>
        readState().customers.find((row) => row.id === String(id)),
      run: () => undefined,
    };
  }

  if (
    normalized ===
    "select * from mockups where customer_id = ? order by created_at desc"
  ) {
    return {
      all: (customerId) =>
        sortMockupsDescending(
          readState().mockups.filter(
            (row) => row.customer_id === String(customerId),
          ),
        ),
      get: () => undefined,
      run: () => undefined,
    };
  }

  if (normalized === "select id, address from customers where id = ?") {
    return {
      all: (id) => {
        const customer = readState().customers.find((row) => row.id === String(id));
        return customer
          ? [{ id: customer.id, address: customer.address }]
          : [];
      },
      get: (id) => {
        const customer = readState().customers.find((row) => row.id === String(id));
        return customer ? { id: customer.id, address: customer.address } : undefined;
      },
      run: () => undefined,
    };
  }

  if (normalized.startsWith("insert into mockups ( id, customer_id,")) {
    return {
      all: () => [],
      get: () => undefined,
      run: (
        id,
        customerId,
        originalImagePath,
        referenceImagePath,
        generatedImagePath,
        prompt,
        createdAt,
      ) => {
        const state = readState();
        state.mockups.push({
          id: String(id),
          customer_id: String(customerId),
          original_image_path: String(originalImagePath),
          reference_image_path: String(referenceImagePath),
          generated_image_path: String(generatedImagePath),
          prompt: String(prompt),
          created_at: String(createdAt),
        });
        writeState(state);
      },
    };
  }

  throw new Error(`Unsupported database statement: ${sql}`);
}

const migrations = [
  {
    version: 1,
    sql: `
      CREATE TABLE customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE mockups (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        original_image_path TEXT NOT NULL,
        reference_image_path TEXT NOT NULL,
        generated_image_path TEXT NOT NULL,
        prompt TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_mockups_customer_id ON mockups(customer_id);
      CREATE INDEX idx_mockups_created_at ON mockups(created_at DESC);
    `,
  },
];

export const database = {
  exec: (_sql: string) => {
    ensureDatabaseFile();
  },
  pragma: (_sql: string) => undefined,
  prepare: (sql: string) => createStatement(sql),
  transaction:
    <TArgs extends unknown[]>(callback: (...args: TArgs) => void) =>
    (...args: TArgs) =>
      callback(...args),
};

export function initializeDatabase() {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedVersions = new Set(
    (database.prepare("SELECT version FROM schema_migrations").all() as {
      version: number;
    }[]).map((row) => row.version),
  );

  const applyMigration = database.transaction((version: number, sql: string) => {
    database.exec(sql);
    database
      .prepare("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)")
      .run(version, new Date().toISOString());
  });

  for (const migration of migrations) {
    if (!appliedVersions.has(migration.version)) {
      applyMigration(migration.version, migration.sql);
    }
  }
}
