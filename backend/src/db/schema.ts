import { sql } from "drizzle-orm";
import {
  mysqlTable,
  bigint,
  varchar,
  uniqueIndex,
  primaryKey,
  index,
  text,
  datetime,
  boolean,
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

export const friends = mysqlTable(
  "friends",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(), // Generated bigint as the primary key
    userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(), // Foreign key to users table
    friendId: bigint("friend_id", { mode: "number", unsigned: true }).notNull(), // Foreign key to users table
    isRequest: boolean("is_request").notNull(), // Indicates if the friend request is a request or a response
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.friendId] }), // Composite primary key for userId and friendId
    index("user_index").on(table.userId), // Index for userId
    index("friend_index").on(table.friendId), // Index for friendId
  ]
);

export const directMessages = mysqlTable(
  "direct_messages",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(), // Generated bigint as the primary key
    senderId: bigint("sender_id", { mode: "number", unsigned: true }).notNull(), // Foreign key to users table
    recipientId: bigint("recipient_id", {
      mode: "number",
      unsigned: true,
    }).notNull(), // Foreign key to users table
    content: text("content").notNull(), // Message content
    createdAt: datetime("created_at")
      .default(sql`NOW()`)
      .notNull(), // Timestamp for when the message was created
  },
  (table) => [
    index("sender_index").on(table.senderId), // Index for senderId
    index("recipient_index").on(table.recipientId), // Index for recipientId
    index("created_at_index").on(table.createdAt), // Index for createdAt
  ]
);
