import {
  mysqlTable,
  bigint,
  varchar,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(), // Generated bigint as the primary key
    displayName: varchar("display_name", { length: 255 }).notNull(), // Display name column
    username: varchar("username", { length: 255 }).notNull(), // Username column
    password: varchar("password", { length: 255 }).notNull(), // Password column
    email: varchar("email", { length: 255 }).notNull(), // Email column (required)
    pronouns: varchar("pronouns", { length: 50 }), // Pronouns column (optional)
    bio: varchar("bio", { length: 2048 }), // Bio column (optional)
  },
  (table) => [
    uniqueIndex("username_unique").on(table.username), // Unique constraint on username
    uniqueIndex("email_unique").on(table.email), // Unique constraint on email
  ]
);
