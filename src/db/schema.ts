import { pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text("name").notNull().unique(),
});

export type User = typeof users.$inferSelect;

// Stores RSS feeds and links each feed to the user who added it.
export const feeds = pgTable("feeds", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  name: text("name").notNull(),

  url: text("url").notNull().unique(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  lastFetchedAt: timestamp("last_fetched_at"),
});

// Stores which users follow which feeds.
export const feedFollows = pgTable(
  "feed_follows",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    feedId: uuid("feed_id")
      .notNull()
      .references(() => feeds.id, { onDelete: "cascade" }),
  },
  (table) => ({
    userFeedUnique: unique().on(table.userId, table.feedId),
  }),
);

export type Feed = typeof feeds.$inferSelect;

// Stores individual posts collected from RSS feeds.
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  title: text("title").notNull(),

  url: text("url").notNull().unique(),

  description: text("description"),

  publishedAt: timestamp("published_at"),

  feedId: uuid("feed_id")
    .notNull()
    .references(() => feeds.id, { onDelete: "cascade" }),
});
