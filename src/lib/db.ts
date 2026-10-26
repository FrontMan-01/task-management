import { Pool, types } from "pg";
import { PGlite } from "@electric-sql/pglite";
import fs from "fs";
import path from "path";

// Ensure PostgreSQL DATE (OID 1082) returns exact YYYY-MM-DD string without timezone shifting
types.setTypeParser(1082, (val: string) => val);

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

const globalForPg = globalThis as unknown as {
  localPg?: PGlite | null;
  pgPool?: Pool | null;
};

// Determine connection strategy
const databaseUrl =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

const isRemotePostgres = Boolean(databaseUrl);

if (isRemotePostgres && !globalForPg.pgPool) {
  globalForPg.pgPool = new Pool({
    connectionString: databaseUrl,
    ssl:
      process.env.NODE_ENV === "production" || !databaseUrl?.includes("localhost")
        ? { rejectUnauthorized: false }
        : undefined,
  });
}

/**
 * Returns a local PostgreSQL 16 engine instance (via PGlite WASM).
 * Runs identical PostgreSQL query engine, types, and planner as cloud Postgres.
 */
function getLocalPostgres(): PGlite {
  if (globalForPg.localPg) return globalForPg.localPg;

  const dataDir = path.join(process.cwd(), ".data", "pglite");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  } else {
    const pidFile = path.join(dataDir, "postmaster.pid");
    if (fs.existsSync(pidFile)) {
      try {
        fs.unlinkSync(pidFile);
      } catch {
        // ignore if not removable
      }
    }
  }

  const instance = new PGlite(dataDir, {
    parsers: {
      1082: (val: string) => val,
    },
  });
  globalForPg.localPg = instance;
  return instance;
}

/**
 * Unified PostgreSQL query executor.
 * Both remote Vercel/Neon and local offline environments execute pure PostgreSQL.
 */
export async function query<T = any>(
  sqlText: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  if (isRemotePostgres && globalForPg.pgPool) {
    const client = await globalForPg.pgPool.connect();
    try {
      const res = await client.query(sqlText, params);
      return {
        rows: res.rows,
        rowCount: res.rowCount ?? res.rows.length,
      };
    } finally {
      client.release();
    }
  }

  // Local real PostgreSQL 16 WASM engine
  const pg = getLocalPostgres();
  try {
    const res = await pg.query(sqlText, params);
    return {
      rows: res.rows as T[],
      rowCount: (res.rows as T[]).length,
    };
  } catch (err: any) {
    console.error("PostgreSQL Query Error:", err.message, "SQL:", sqlText);
    throw err;
  }
}

/**
 * Initializes schema and performance indices using pure PostgreSQL syntax.
 */
export async function initDatabase(): Promise<void> {
  const schemaPath = path.join(process.cwd(), "src", "lib", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  if (isRemotePostgres && globalForPg.pgPool) {
    await globalForPg.pgPool.query(schemaSql);
    console.log("Remote PostgreSQL schema initialized successfully.");
  } else {
    const pg = getLocalPostgres();
    await pg.exec(schemaSql);
    console.log("Local PostgreSQL 16 engine schema initialized successfully.");
  }
}

export async function closeDatabase(): Promise<void> {
  if (globalForPg.localPg) {
    try {
      await globalForPg.localPg.close();
    } catch {}
    globalForPg.localPg = null;
  }
  if (globalForPg.pgPool) {
    try {
      await globalForPg.pgPool.end();
    } catch {}
    globalForPg.pgPool = null;
  }
}
