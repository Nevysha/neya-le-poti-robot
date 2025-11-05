import dotenv from 'dotenv';

if (process.env.EXEC_ENV === null) {
  console.error(new Error('EXEC_ENV environment variable is not set'));
  process.exit(1);
}

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

const mode = process.env.EXEC_ENV || 'development';
dotenv.config({ path: '.env' });
dotenv.config({ path: `./.env.local`, override: true });
dotenv.config({ path: `./.env.${mode}`, override: true });
dotenv.config({ path: `./.env.${mode}.local`, override: true });
const { RESET_DB, ...EnvRaw } = process.env as TEnvRaw;

export const Env: TEnv = {
  RESET_DB: RESET_DB === 'true',
  ...EnvRaw,
};
