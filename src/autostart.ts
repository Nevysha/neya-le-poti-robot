import { bootstrap, botPrepare } from '#nlpr/bootstraper.js';
import { Logger } from '#nlpr/Logger.js';

const run = async () => {
  const currentRunCmd = process.argv.join(' ');
  Logger.info(`Current run command: ${currentRunCmd}`);

  let crashCount = 0;

  const clientWrapper = await bootstrap();
  const { autorun, destroy } = await botPrepare(clientWrapper);

  try {
    autorun();
  } catch (e) {
    crashCount++;
    Logger.error(e);
    Logger.error(`Crash count: ${crashCount}`);

    if (crashCount > 10) {
      Logger.error('Too many crashes, Reporting and exiting...');
      await clientWrapper.sendCrashAlert();
      process.exit(1);
    }

    await destroy();
    await run();
  }
};
void run();
