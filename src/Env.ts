import { Logger } from '#nlpr/Logger.js';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === null || process.env.NODE_ENV === undefined) {
  console.error(new Error('NODE_ENV environment variable is not set'));
  process.exit(1);
}

Logger.info(`Executing in ${process.env.NODE_ENV} mode`);

type TEnvRaw = {
  DISCORD_TOKEN: string;
  IS_TEST: string;
  APP_ID: string;
  RESET_DB: string;
};

export type TEnv = {
  DISCORD_TOKEN: string;
  IS_TEST: string;
  APP_ID: string;
  RESET_DB: boolean;
};

const mode = process.env.NODE_ENV || 'development';
dotenv.config({ quiet: true, path: '.env' });
dotenv.config({ quiet: true, path: `./.env.local`, override: true });
dotenv.config({ quiet: true, path: `./.env.${mode}`, override: true });
dotenv.config({ quiet: true, path: `./.env.${mode}.local`, override: true });
const { RESET_DB, ...EnvRaw } = process.env as TEnvRaw;

export const Env: TEnv = {
  RESET_DB: RESET_DB === 'true',
  ...EnvRaw,
};
