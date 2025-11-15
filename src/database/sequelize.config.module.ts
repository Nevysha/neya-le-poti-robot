import type { Options as SequelizeOptions } from 'sequelize/lib/sequelize';
import config from './sequelize.config.json' with { type: 'json' };

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

export default config as NeyaSequelizeConfig;
