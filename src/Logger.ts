import chalk from 'chalk';
import pino from 'pino';

export { chalk };

export const Logger = pino({
  level: 'debug',
  // level: 'debug',
  // level: 'info',
  customLevels: {
    verbose: 35,
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

export const LOG_SEPARATOR = chalk.gray(
  '------------------------------------------------------',
);
