import { eq } from "drizzle-orm";

import { db } from "../index.js";
import { users } from "../schema.js";

// Creates and returns a new user.
export async function createUser(name: string) {
  const [user] = await db.insert(users).values({ name }).returning();

  return user;
}

// Finds a user by name.
export async function getUserByName(name: string) {
  const [user] = await db.select().from(users).where(eq(users.name, name));

  return user;
}

// Returns all users.
export async function getUsers() {
  return db.select().from(users);
}

// Deletes every user.
export async function deleteAllUsers(): Promise<void> {
  await db.delete(users);
}
