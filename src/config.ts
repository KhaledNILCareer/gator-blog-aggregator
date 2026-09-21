import os from "os";
import path from "path";
import fs from "fs";

export type Config = {
  dbUrl: string,
  currentUserName?: string
}

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

function validateConfig(rawConfig: any): Config {
  if (typeof rawConfig !== "object" || rawConfig === null) {
    throw new Error("Invalid config");
  }
  if (typeof rawConfig.db_url !== "string") {
    throw new Error("Invalid config: db_url must be a string");
  }
  if (
    rawConfig.current_user_name !== undefined &&
    typeof rawConfig.current_user_name !== "string"
  ) {
    throw new Error("Invalid config: current_user_name must be a string");
  }
  const config: Config = {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  };
  return config
}

export function readConfig(): Config {
  const configPath = getConfigFilePath();

  const fileContent = fs.readFileSync(configPath, {
    encoding: "utf-8",
  });

  const rawConfig = JSON.parse(fileContent);

  return validateConfig(rawConfig);
}

function writeConfig(cfg: Config): void {
  const cfgSnakeCase = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };

  const configPath = getConfigFilePath();
  const data = JSON.stringify(cfgSnakeCase, null, 2);

  fs.writeFileSync(configPath, data);
  
}

export function setUser(userName: string): void {
  const cfg = readConfig();

  cfg.currentUserName = userName;

  writeConfig(cfg);

}
