import chalk from 'chalk';
import pino from 'pino';
import pretty from 'pino-pretty';

export { chalk };

export const Logger = pino(pretty({ sync: true }));

export const LOG_SEPARATOR = chalk.gray(
  '------------------------------------------------------',
);
