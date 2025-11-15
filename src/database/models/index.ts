import fs from 'fs';
import path from 'path';
import process from 'process';
import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';

import sequelizeConfig = require('@nlpr/database/sequelize.config.js');

const basename = path.basename(__filename);
const env = (process.env.NODE_ENV ||
  'development') as keyof typeof sequelizeConfig;

// The shape of a single model with an optional associate method
export interface AssociableModel extends ModelStatic<Model> {
  associate?(db: Db): void;
}

// The overall DB object that will be exported
export interface Db {
  [modelName: string]: AssociableModel | Sequelize | typeof Sequelize;
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
}

// Pick config for the current environment
const config = sequelizeConfig[env];

const db: Db = {} as Db;

let sequelize: Sequelize;
if (config.use_env_variable) {
  const connectionUri = process.env[config.use_env_variable];
  if (!connectionUri) {
    throw new Error(
      `Environment variable ${config.use_env_variable} is not set but is required by Sequelize configuration.`,
    );
  }
  sequelize = new Sequelize(connectionUri, config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

// Load all model files in this directory (compiled .js files at runtime)
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach((file) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const modelFactory = require(path.join(__dirname, file)) as (
      sequelize: Sequelize,
      dataTypes: typeof DataTypes,
    ) => AssociableModel;

    const model = modelFactory(sequelize, DataTypes);
    db[model.name] = model;
  });

// Call associate(db) if defined on any model
Object.keys(db).forEach((modelName) => {
  const model = db[modelName];
  if (
    model &&
    typeof model === 'object' &&
    'associate' in model &&
    typeof model.associate === 'function'
  ) {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
