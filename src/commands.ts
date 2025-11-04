import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { TEnv } from './PotiRobotClientWrapper.ts';

const mode = process.env.NODE_ENV || 'development';
dotenv.config({ path: '.env' });
dotenv.config({ path: `./.env.local`, override: true });
dotenv.config({ path: `./.env.${mode}`, override: true });
dotenv.config({ path: `./.env.${mode}.local`, override: true });
const env = process.env as TEnv;

async function refreshCommands() {
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);

  const commands = [
    {
      name: 'ping',
      description: 'Replies with Pong!',
    },
    {
      name: 'refresh-events',
      description: 'Refresh events',
    },
  ];

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(env.APP_ID), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

(async () => {
  await refreshCommands();
})();
