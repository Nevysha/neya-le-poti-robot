import { Logger } from '#nlpr/Logger.js';
import { PotiRobotClientWrapper } from '#nlpr/PotiRobotClientWrapper.js';
import { databaseInit, db } from '#nlpr/database/database.js';
import { Events } from 'discord.js';

export const bootstrap = async () => {
  await databaseInit();

  return await PotiRobotClientWrapper.start();
};

export const botPrepare = async (clientWrapper: PotiRobotClientWrapper) => {
  await clientWrapper.maybeInitData();

  clientWrapper.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (!interaction.isChatInputCommand()) return;
      if (!interaction.inGuild()) return;

      const guild = interaction.guild;
      if (!guild) {
        Logger.info('Guild not found');
        await interaction.reply('This command can only be used in a guild.');
        return;
      }

      const { commandName } = interaction;
      Logger.info(`Command ${commandName} received`);

      switch (commandName) {
        case 'ping': {
          await interaction.reply('Pong!');
          break;
        }
        case 'refresh-events': {
          // do not await
          void clientWrapper.refreshEvents(guild);
          await interaction.reply('Refreshing events...');
          break;
        }
        case 'clear-channel': {
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
            // await channel.bulkDelete(channel.messages.cache);

            // delete all message individually to avoid 15 days limit
            for (const message of channel.messages.cache.values()) {
              try {
                await message.delete();
              } catch (e) {
                Logger.error(
                  `Error deleting message ${message.id}: ${message.content}`,
                );
                Logger.error(e);
              }
            }

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
            Logger.info(`Cleared messages in ${channel.name}`);
          })();
          await interaction.reply('Clearing channel messages...');
          break;
        }
        case 'clear-db-events': {
          await interaction.reply('Clearing event from database...');
          void (async () => {
            await db.ScheduledEvent.destroy({
              where: {
                guildId: guild.id,
              },
            });
          })();
          break;
        }
        default: {
          Logger.info(`Unknown command ${commandName}`);
          await interaction.reply('Unknown command');
          break;
        }
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
    Logger.info(`New user joined event ${event.name}`);
  });

  clientWrapper.on(Events.GuildScheduledEventCreate, async (guildEvent) => {
    const guild = guildEvent.guild;
    if (!guild) {
      console.error('Guild not found');
      return;
    }

    Logger.info(`New event created: ${guildEvent.name}`);
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

    Logger.info(`New event created: ${guildEvent.name}`);
    await clientWrapper.prepareAndSendEventRecap(guild);
  });

  // repeat clientWrapper.refreshEvents(guild); every minute
  const taskFn = async () => {
    Logger.info('Running scheduled refresh task');
    // get all guilds
    const guilds = await clientWrapper.nativeReadyClient.guilds.fetch();
    for (const lazyGuild of guilds.values()) {
      const guild = await lazyGuild.fetch();
      await clientWrapper.refreshEvents(guild);
    }
  };

  //run first refresh immediately
  Logger.info('Running first refresh immediately');
  await taskFn();

  Logger.info('Ready. Waiting...');

  let repeater: null | NodeJS.Timeout = null;

  return {
    autorun: () => {
      Logger.info('Setting up refresh task to run every minute.');
      repeater = setInterval(taskFn, 60000);
    },
    destroy: async () => {
      Logger.info('Destroying refresh task.');
      if (repeater) {
        clearInterval(repeater);
        repeater = null;
      }
      await clientWrapper.nativeReadyClient.destroy();
    },
  };
};
