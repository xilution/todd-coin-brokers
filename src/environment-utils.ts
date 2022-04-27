import { DatabaseSettings } from "./types";

const DEFAULT_DB_NAME = "todd-coin";
const DEFAULT_DB_USERNAME = "postgres";
const DEFAULT_DB_PASSWORD = "secret";
const DEFAULT_DB_HOST = "localhost";
const DEFAULT_DB_PORT = 5432;

export const getDatabaseSettings = (): DatabaseSettings => {
  const database = process.env.DB_NAME || DEFAULT_DB_NAME;
  const username = process.env.DB_USERNAME || DEFAULT_DB_USERNAME;
  const password = process.env.DB_PASSWORD || DEFAULT_DB_PASSWORD;
  const dbHost = process.env.DB_HOST || DEFAULT_DB_HOST;
  const dbPort = Number(process.env.DB_PORT) || DEFAULT_DB_PORT;

  return {
    database,
    username,
    password,
    dbHost,
    dbPort,
  };
};

export default {
  getDatabaseSettings,
};
