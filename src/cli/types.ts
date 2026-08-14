import type { User } from "../db/schema.js";

// Defines the shape of every CLI command handler.
export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;

// Defines commands that require a logged-in user.
export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

// Maps command names to their handler functions.
export type CommandsRegistry = Record<string, CommandHandler>;
