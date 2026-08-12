import fs from "fs";
import os from "os";
import path from "path";

type Config = {
  dbUrl: string;
  currentUserName: string;
};

// Update the current user and save the config file.
export function setUser(userName: string) {
  const config = readConfig();
  config.currentUserName = userName;
  writeConfig(config);
}

// Validate raw JSON data and convert it to Config.
function validateConfig(rawConfig: any): Config {
  if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
    throw new Error("db_url is required in config file");
  }

  const config: Config = {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name ?? "",
  };

  return config;
}

// Read the config file and return a validated Config object.
export function readConfig(): Config {
  const fullPath = getConfigFilePath();

  const data = fs.readFileSync(fullPath, "utf-8");
  const rawConfig = JSON.parse(data);

  return validateConfig(rawConfig);
}

// Build the full path to ~/.gatorconfig.json.
function getConfigFilePath(): string {
  const configFileName = ".gatorconfig.json";
  const homeDir = os.homedir();

  return path.join(homeDir, configFileName);
}

// Convert Config to JSON format and save it to the file.
function writeConfig(config: Config): void {
  const fullPath = getConfigFilePath();

  const rawConfig = {
    db_url: config.dbUrl,
    current_user_name: config.currentUserName,
  };

  const data = JSON.stringify(rawConfig, null, 2);

  fs.writeFileSync(fullPath, data, {
    encoding: "utf-8",
  });
}