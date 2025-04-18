import { drizzle } from "drizzle-orm/mysql2";

console.log("Connecting to database at", process.env.DATABASE_URL);

export const db = drizzle(process.env.DATABASE_URL!);
