import { dbConfig, sequelize } from '#nlpr/database/database.js';
import { Logger } from '#nlpr/Logger.js';
import fs from 'fs';
import path from 'node:path';
import { DataTypes } from 'sequelize';
import { AutoOptions, SequelizeAuto } from 'sequelize-auto';

const options = {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  directory: './src/database/models',
  lang: 'ts',
  caseFile: 'p',
  caseModel: 'p',
  caseProp: 'c',
  additional: {
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
} as AutoOptions;

const auto = new SequelizeAuto(sequelize, 'user', 'password', options);

const clearOutputFolder = () => {
  const targetDir = options.directory!;
  if (!fs.existsSync(targetDir)) {
    Logger.info(
      `Target directory does not exist: ${targetDir}. Nothing to do.`,
    );
    return;
  }

  Logger.info(`Cleaning target directory: ${targetDir}`);

  // Delete old generated files before running sequelize-auto

  const existingFiles = fs.readdirSync(targetDir);
  for (const file of existingFiles) {
    const fullPath = path.join(targetDir, file);

    // file to keep
    if (['index.ts', 'NevyModel.ts'].includes(file)) {
      Logger.info(`Skipping file: ${file}`);
      continue;
    }

    const stat = fs.statSync(fullPath);
    if (stat.isFile()) {
      fs.unlinkSync(fullPath);
      Logger.info(`Deleted old file: ${file}`);
    }
  }
};

(async () => {
  Logger.info('Running SequelizeAutoModelGenerate script...');

  clearOutputFolder();

  // run the auto generation
  await auto.run();

  // post-process generated files: replace relative imports with #nlpr alias
  const files = fs
    .readdirSync(targetDir)
    .filter((file) => file.endsWith('.ts'));

  for (const file of files) {
    const filePath = path.join(targetDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace imports like: import {...} from "./BotMessages";
    // with:                   import {...} from "#nlpr/database/auto-models/BotMessages.js";
    content = content
      .replace(/from '\.\/([^']+)'/g, "from '#nlpr/database/auto-models/$1.js'")
      .replace(
        /from "\.\/([^"]+)"/g,
        'from "#nlpr/database/auto-models/$1.js"',
      );

    fs.writeFileSync(filePath, content, 'utf8');
  }

  // list files that are present in the model folder (options.directory) after script execution
  Logger.info(`Generated files:`);
  const remainingFiles = fs.readdirSync(options.directory!);
  for (const file of remainingFiles) {
    Logger.info(`- ${file}`);
  }

  // TODO delete files no longer needed

  Logger.info('SequelizeAutoModelGenerate script completed successfully.');
})();
