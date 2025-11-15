import { Env } from '#nlpr/Env.js';
import { Logger } from '#nlpr/Logger.ts';
import { REST, Routes } from 'discord.js';

async function refreshCommands() {
  const rest = new REST({ version: '10' }).setToken(Env.DISCORD_TOKEN);

  const commands = [
    {
      name: 'ping',
      description: 'Replies with Pong!',
    },
    {
      name: 'refresh-events',
      description: 'Refresh events',
    },
    {
      name: 'clear-channel',
      description: 'Clear current channel',
    },
  ];

  try {
    Logger.info('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(Env.APP_ID), {
      body: commands,
    });

    Logger.info('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

(async () => {
  await refreshCommands();
})();
