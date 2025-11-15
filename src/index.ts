import { bootstrap, botStart } from '#nlpr/bootstraper.ts';
import { Logger } from '#nlpr/Logger.ts';
import { input } from '@inquirer/prompts';
import fs from 'fs';

const HISTORY_FILE = '.nlpr.history';

// check if a history file for the inquirer prompts
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, '');
}

(async () => {
  const clientWrapper = await bootstrap();

  // get last cmd from history file if any
  const history = fs.readFileSync(HISTORY_FILE, 'utf8').split('\n');
  const lastCmd = history.length > 1 ? history[history.length - 2] : undefined;

  const cmd = await input({ message: 'CMD:', default: lastCmd });
  // write cmd to history file
  if (cmd !== '') {
    fs.appendFileSync(HISTORY_FILE, `${cmd}\n`);
  }

  switch (cmd) {
    case 'exit': {
      Logger.info('Exiting...');
      break;
    }
    case 'init-role': {
      await clientWrapper.initRolesData();
      break;
    }
    case 'refresh-events': {
      const guilds = await clientWrapper.nativeReadyClient.guilds.fetch();
      for (const lazyGuild of guilds.values()) {
        const guild = await lazyGuild.fetch();
        await clientWrapper.refreshEvents(guild);
      }
      break;
    }
    case 'start': {
      await botStart(clientWrapper);
      break;
    }
    default: {
      Logger.warn(`Unknown command: ${cmd}`);
    }
  }

  process.exit(0);
})();
