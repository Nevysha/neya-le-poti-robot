import type { Options as SequelizeOptions } from 'sequelize';

type Options = SequelizeOptions & {
  use_env_variable?: string;
  database: string;
  username: string;
};

export interface NeyaSequelizeConfig {
  development: Options;
  test: Options;
  prod: Options;
}

declare const config: NeyaSequelizeConfig;

export = config;
