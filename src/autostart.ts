import { bootstrap, botPrepare } from '#nlpr/bootstraper.js';
import { Logger } from '#nlpr/Logger.js';

const run = async () => {
  const clientWrapper = await bootstrap();
  const { autorun, destroy } = await botPrepare(clientWrapper);

  try {
    autorun();
  } catch (e) {
    Logger.error(e);
    await destroy();
    await run();
  }
};
void run();
