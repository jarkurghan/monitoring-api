import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { IS_HAVE_DATABASE_URL } from "@/config/env";
import { DATABASE_URL } from "@/config/env";

if (!IS_HAVE_DATABASE_URL) {
    throw new Error("Database env variables are not fully set");
}

export const sql = postgres(DATABASE_URL, { max: 1, idle_timeout: 5, prepare: false });
export const db = drizzle(sql);
