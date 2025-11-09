import { Events } from 'discord.js';
import { PotiRobotClientWrapper } from './PotiRobotClientWrapper.js';
import { databaseInit, db } from './database.js';

(async () => {
  await databaseInit();

  const clientWrapper: PotiRobotClientWrapper =
    await PotiRobotClientWrapper.start();

  await clientWrapper.maybeInitData();

  clientWrapper.on(Events.InteractionCreate, async (interaction) => {
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
          void clientWrapper.refreshEvents(guild);
          await interaction.reply('Refreshing events...');
          break;
        case 'clear-channel':
          const channel = interaction.channel;
          if (!channel || !channel.isTextBased()) {
            await interaction.reply(
              'This command can only be used in text channels.',
            );
            return;
          }
          // do not await
          void (async () => {
            await channel.messages.fetch();
            await channel.bulkDelete(channel.messages.cache);
            await db.ScheduledEventMessage.destroy({
              where: {
                guildId: guild.id,
              },
            });
            await db.BotMessage.destroy({
              where: {
                guildId: guild.id,
              },
            });
            console.log(`Cleared messages in ${channel.name}`);
          })();
          await interaction.reply('Clearing channel messages...');
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
  });

  clientWrapper.on(Events.GuildScheduledEventUserAdd, async (event) => {
    console.log(`New user joined event ${event.name}`);
  });

  clientWrapper.on(Events.GuildScheduledEventCreate, async (guildEvent) => {
    const guild = guildEvent.guild;
    if (!guild) {
      console.error('Guild not found');
      return;
    }

    console.log(`New event created: ${guildEvent.name}`);
    await clientWrapper.prepareAndSendEventRecap(guild);
  });

  clientWrapper.on(Events.GuildScheduledEventUpdate, async (guildEvent) => {
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
  });

  // repeat clientWrapper.refreshEvents(guild); every minute
  const taskFn = async () => {
    console.log('Running scheduled refresh task');
    // get all guilds
    const guilds = await clientWrapper.nativeReadyClient.guilds.fetch();
    for (const lazyGuild of guilds.values()) {
      const guild = await lazyGuild.fetch();
      await clientWrapper.refreshEvents(guild);
    }
  };
  console.log('Setting up refresh task to run every minute.');
  setInterval(taskFn, 60000);

  console.log('Ready. Waiting...');
})();
