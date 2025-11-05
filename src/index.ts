import { Events } from 'discord.js';
import dotenv from 'dotenv';
import { PotiRobotClientWrapper, TEnv } from './PotiRobotClientWrapper.ts';

const mode = process.env.NODE_ENV || 'development';
dotenv.config({ path: '.env' });
dotenv.config({ path: `./.env.local`, override: true });
dotenv.config({ path: `./.env.${mode}`, override: true });
dotenv.config({ path: `./.env.${mode}.local`, override: true });
const env = process.env as TEnv;

(async () => {
  const clientWrapper: PotiRobotClientWrapper =
    await PotiRobotClientWrapper.start(env);

  /**
   * Refresh events for all guilds
   */
  const refreshEvents = async () => {
    const guildManager = clientWrapper.nativeReadyClient.guilds;
    const lazyGuilds = await guildManager.fetch();
    for (const [_guildId, lazyGuild] of lazyGuilds) {
      const guild = await lazyGuild.fetch();

      // ignore guild neyaneyaneya atm
      if (guild.name === 'neyaneyaneya') {
        console.log(`Skipping guild ${guild.name}`);
        continue;
      }

      console.log(`Fetching for guild ${guild.name}`);

      await clientWrapper.clearMessages(guild);

      await clientWrapper.prepareAndSendEventRecap(guild);

      await clientWrapper.maybeSendReadyMessages(guild);
    }
  };

  clientWrapper.nativeReadyClient.on(
    Events.InteractionCreate,
    async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const { commandName } = interaction;
      console.log(`Command ${commandName} received`);

      switch (commandName) {
        case 'ping':
          await interaction.reply('Pong!');
          break;
        case 'refresh-events':
          // do not await
          void refreshEvents();
          await interaction.reply('Refreshing events...');
          break;
        default:
          console.log(`Unknown command ${commandName}`);
          await interaction.reply('Unknown command');
          break;
      }
    },
  );

  clientWrapper.nativeReadyClient.on(
    Events.GuildScheduledEventUserAdd,
    async (event) => {
      console.log(`New user joined event ${event.name}`);
    },
  );

  const commands =
    await clientWrapper.nativeReadyClient.application.commands.fetch();
  console.log(commands.map((command) => command.name).join(', '));
})();
