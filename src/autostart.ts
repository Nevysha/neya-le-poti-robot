import { bootstrap, botStart } from '#nlpr/bootstraper.js';

(async () => {
  const clientWrapper = await bootstrap();
  await botStart(clientWrapper);
})();
