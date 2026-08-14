import fs from "node:fs";
import os from "node:os";
import path from "node:path";

type Config = {
  dbUrl: string;
  currentUserName: string;
};

// Checks whether a value is a plain object-like record.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Validates raw JSON and converts it to application config.
function validateConfig(rawConfig: unknown): Config {
  if (!isRecord(rawConfig)) {
    throw new Error("Invalid config file");
  }

  if (typeof rawConfig.db_url !== "string" || rawConfig.db_url.length === 0) {
    throw new Error("db_url is required in config file");
  }

  if (
    rawConfig.current_user_name !== undefined &&
    typeof rawConfig.current_user_name !== "string"
  ) {
    throw new Error("current_user_name must be a string");
  }

  return {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name ?? "",
  };
}

// Builds the path to ~/.gatorconfig.json.
function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

// Writes application config to the JSON file.
function writeConfig(config: Config): void {
  const rawConfig = {
    db_url: config.dbUrl,
    current_user_name: config.currentUserName,
  };

  fs.writeFileSync(
    getConfigFilePath(),
    JSON.stringify(rawConfig, null, 2),
    "utf-8",
  );
}

// Reads and validates the application config.
export function readConfig(): Config {
  const data = fs.readFileSync(getConfigFilePath(), "utf-8");

  const rawConfig: unknown = JSON.parse(data);

  return validateConfig(rawConfig);
}

// Changes the currently logged-in user.
export function setUser(userName: string): void {
  const config = readConfig();

  writeConfig({
    ...config,
    currentUserName: userName,
  });
}
