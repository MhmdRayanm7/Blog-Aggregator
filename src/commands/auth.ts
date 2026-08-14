import { readConfig, setUser } from "../config.js";

import {
  createUser,
  deleteAllUsers,
  getUserByName,
  getUsers,
} from "../db/queries/users.js";

// Registers a new user and makes them the current user.
export async function handlerRegister(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error(`Usage: ${cmdName} <username>`);
  }

  const userName = args[0];
  const existingUser = await getUserByName(userName);

  if (existingUser) {
    throw new Error(`User "${userName}" already exists`);
  }

  const user = await createUser(userName);

  setUser(userName);

  console.log(`User "${userName}" was created`);
  console.log(user);
}

// Logs in as an existing user.
export async function handlerLogin(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error(`Usage: ${cmdName} <username>`);
  }

  const userName = args[0];
  const user = await getUserByName(userName);

  if (!user) {
    throw new Error(`User "${userName}" does not exist`);
  }

  setUser(userName);

  console.log(`User has been set to ${userName}`);
}

// Prints all users and marks the current user.
export async function handlerUsers(): Promise<void> {
  const users = await getUsers();
  const config = readConfig();

  users.forEach((user) => {
    const currentLabel =
      user.name === config.currentUserName ? " (current)" : "";

    console.log(`* ${user.name}${currentLabel}`);
  });
}

// Deletes all application data through the users cascade.
export async function handlerReset(): Promise<void> {
  await deleteAllUsers();

  console.log("Database reset successfully");
}
