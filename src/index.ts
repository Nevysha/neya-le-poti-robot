import { Events, Guild } from 'discord.js';
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
  const refreshEvents = async (guild: Guild) => {
    guild = await guild.fetch();

    console.log(`Fetching for guild ${guild.name}`);

    await clientWrapper.clearMessages(guild);

    await clientWrapper.prepareAndSendEventRecap(guild);

    await clientWrapper.maybeSendReadyMessages(guild);
  };

  clientWrapper.nativeReadyClient.on(
    Events.InteractionCreate,
    async (interaction) => {
      try {
        if (!interaction.isChatInputCommand()) return;
        if (!interaction.inGuild()) return;

        const guild = interaction.guild;
        if (!guild) {
          console.log('Guild not found');
          await interaction.reply('This command can only be used in a guild.');
          return;
        }

        const { commandName } = interaction;
        console.log(`Command ${commandName} received`);

        switch (commandName) {
          case 'ping':
            await interaction.reply('Pong!');
            break;
          case 'refresh-events':
            // do not await
            void refreshEvents(guild);
            await interaction.reply('Refreshing events...');
            break;
          default:
            console.log(`Unknown command ${commandName}`);
            await interaction.reply('Unknown command');
            break;
        }
      } catch (e) {
        console.error('Error handling interaction:');
        console.error(interaction);
        console.error(e);
        if (interaction.isRepliable()) {
          await interaction.reply(
            'Unknown error occurred while processing the command.',
          );
        }
      }
    },
  );

  clientWrapper.nativeReadyClient.on(
    Events.GuildScheduledEventUserAdd,
    async (event) => {
      console.log(`New user joined event ${event.name}`);
    },
  );

  clientWrapper.nativeReadyClient.on(
    Events.GuildScheduledEventCreate,
    async (guildEvent) => {
      const guild = guildEvent.guild;
      if (!guild) {
        console.error('Guild not found');
        return;
      }

      console.log(`New event created: ${guildEvent.name}`);
      await clientWrapper.prepareAndSendEventRecap(guild);
    },
  );

  clientWrapper.nativeReadyClient.on(
    Events.GuildScheduledEventUpdate,
    async (guildEvent) => {
      if (!guildEvent) {
        console.error('Guild event not found');
        return;
      }
      const guild = guildEvent.guild;
      if (!guild) {
        console.error('Guild not found');
        return;
      }

      console.log(`New event created: ${guildEvent.name}`);
      await clientWrapper.prepareAndSendEventRecap(guild);
    },
  );

  const commands =
    await clientWrapper.nativeReadyClient.application.commands.fetch();
  console.log(commands.map((command) => command.name).join(', '));
})();
