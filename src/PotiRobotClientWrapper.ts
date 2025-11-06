import {
  BaseMessageOptions,
  ChannelType,
  Client,
  ContainerBuilder,
  Events,
  GatewayIntentBits,
  Guild,
  GuildScheduledEvent,
  GuildScheduledEventStatus,
  MessageFlags,
  SectionBuilder,
  TextChannel,
  TextDisplayBuilder,
} from 'discord.js';
import { Env } from './Env.ts';
import { createScheduledEventHash, db } from './database.ts';

/**
 * Wrapper around the native discord client to add some features
 */
export class PotiRobotClientWrapper {
  /**
   * Constructor
   *
   * @param nativeReadyClient
   */
  constructor(public nativeReadyClient: Client<true>) {}

  /**
   * Bootstrap and Start the client
   *
   */
  static async start(): Promise<PotiRobotClientWrapper> {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    return new Promise(async (resolve, reject) => {
      try {
        client.once(Events.ClientReady, async (readyClient) => {
          console.log(`Ready! Logged in as ${readyClient.user.tag}`);

          const commands = await readyClient.application.commands.fetch();
          console.log(commands.map((command) => command.name).join(', '));

          resolve(new PotiRobotClientWrapper(readyClient));
        });

        await client.login(Env.DISCORD_TOKEN);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Clear all messages in the channel for the guild
   *
   * @param guild
   */
  public async clearMessages(guild: Guild) {
    console.log(`Clearing messages for guild ${guild.name}`);

    const channel = await this.getChannel(guild);
    await channel.messages.fetch();
    await channel.bulkDelete(channel.messages.cache);
  }

  channels = {
    TDJ: {
      prod: 'calendrier-ffxiv',
      test: 'calendrier-ffxiv-test',
    },
    neyaneyaneya: {
      prod: 'dev',
      test: 'dev',
    },
  } as Record<string, { prod: string; test: string } | null>;

  /**
   * Get a valid channel to send messages
   *
   * @param guild
   */
  public async getChannel(guild: Guild) {
    // get calendrier-ffxiv-test or calendrier-ffxiv
    const testOrProd = Env.IS_TEST === 'true' ? 'test' : 'prod';
    const channelName = this.channels[guild.name]?.[testOrProd];

    if (!channelName) {
      throw new Error(
        `Channel not found for guild ${guild.name} for env ${testOrProd}`,
      );
    }

    return await this.findGuildChannel(guild, channelName);
  }

  private async findGuildChannel(guild: Guild, channelName: string) {
    // collecting channels
    const channels = await guild.channels.fetch();

    const channelUnsafeType = channels.find(
      (channel) => channel?.name === channelName,
    );

    if (!channelUnsafeType) {
      throw new Error(
        `Channel ${channelName} not found in guild ${guild.name}`,
      );
    }

    if (channelUnsafeType.type !== ChannelType.GuildText) {
      throw new Error(`Channel ${channelName} is not a text channel`);
    }

    return channelUnsafeType as TextChannel;
  }

  /**
   * Prepare and send a message for each event
   *
   * @param guild
   */
  public async prepareAndSendEventRecap(guild: Guild) {
    const [savedGuild] = await db.Guild.findOrCreate({
      where: {
        discordId: guild.id,
        name: guild.name,
      },
    });

    const unSortedEvents = await guild.scheduledEvents.fetch();

    // sort events by scheduledStartTimestamp
    const events = unSortedEvents.sort(
      (a, b) =>
        (a.scheduledStartTimestamp ?? 0) - (b.scheduledStartTimestamp ?? 0),
    );
    console.log(
      `Found ${events.size} events [${events.map((event) => event.name).join(', ')}]`,
    );

    for (const [_eventId, event] of events) {
      const [savedEvent] = await db.ScheduledEvent.findOrCreate({
        where: {
          discordId: event.id,
        },
      });

      const savedScheduledEventMessage = await db.ScheduledEventMessage.findOne(
        {
          where: {
            scheduledEventId: savedEvent.get('id'),
          },
        },
      );

      const subscribers = await event.fetchSubscribers();

      const receivedEventHash = createScheduledEventHash({
        name: event.name,
        scheduledStartTimestamp: event.scheduledStartTimestamp ?? 0,
        subscribers: Array.from(subscribers.keys()),
      });

      // check if event hash is the same as the one in the database
      if (
        savedScheduledEventMessage !== null &&
        receivedEventHash === savedEvent.get('hash')
      ) {
        console.log(`No change on event ${event.name}. Skipping.`);
        continue;
      }

      // update event
      savedEvent.set('name', event.name);
      savedEvent.set('hash', receivedEventHash);
      await savedEvent.save();

      const startTimeStamp = event.scheduledStartTimestamp;
      if (!startTimeStamp) {
        console.warn('Event has no scheduled start timestamp');
        continue;
      }

      // format to locale fr-FR in format dd/mm/yyyy hh:mm:ss
      const formattedDate = new Date(startTimeStamp).toLocaleDateString(
        'fr-FR',
        {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        },
      );
      const mainContainer = new ContainerBuilder().setAccentColor(0xe0569b);

      const header = new TextDisplayBuilder().setContent(
        '# ' + event.name + '\n\n' + formattedDate,
      );
      const eventUrl = new TextDisplayBuilder().setContent(event.url);

      const coverImageURL = event.coverImageURL();
      if (coverImageURL) {
        const sectionBuilder = new SectionBuilder()
          .addTextDisplayComponents(header)
          .addTextDisplayComponents(eventUrl);

        sectionBuilder.setThumbnailAccessory((thumbnail) =>
          thumbnail
            .setDescription('Calendrier FFXIV - Événement: ' + event.name)
            .setURL(coverImageURL),
        );
        mainContainer.addSectionComponents(sectionBuilder);
      } else {
        mainContainer.addTextDisplayComponents(header);
        mainContainer.addTextDisplayComponents(eventUrl);
      }

      mainContainer.addSeparatorComponents((separator) => separator);
      const textDisplay: TextDisplayBuilder = new TextDisplayBuilder();
      const textDisplayContent: string[] = [];
      textDisplayContent.push('## Inscrits :');
      for (const [_subscriberId, subscriber] of subscribers) {
        textDisplayContent.push(`- ${subscriber.user.displayName}`);
      }
      textDisplay.setContent(textDisplayContent.join('\n'));

      mainContainer.addTextDisplayComponents(textDisplay);

      // only send message if not already sent
      if (savedScheduledEventMessage === null) {
        const msg = await this.send(guild, [mainContainer]);

        const savedChannelId = (
          await db.Channel.findOne({
            where: {
              discordId: msg.channel.id,
            },
          })
        )?.get('id');

        if (savedChannelId === null) {
          throw new Error(
            `Channel not found for event ${savedEvent.get('id')}`,
          );
        }

        const savedBotMessage = await db.BotMessage.create({
          discordId: msg.id,
          guildId: savedGuild.get('id'),
          channelId: savedChannelId,
        });

        await db.ScheduledEventMessage.create({
          scheduledEventId: savedEvent.get('id'),
          botMessageId: savedBotMessage.get('id'),
        });
        continue;
      }

      // else, update the existing message
      const savedBotMessage = await db.BotMessage.findOne({
        where: {
          id: savedScheduledEventMessage.get('botMessageId'),
        },
      });
      if (savedBotMessage === null) {
        throw new Error(
          `BotMessage not found for scheduled event ${savedEvent.get('id')}`,
        );
      }

      const discordMsg = await (
        await this.getChannel(guild)
      ).messages.fetch(savedBotMessage.get('discordId') as string);
      if (discordMsg === null) {
        throw new Error(
          `Discord message not found for bot message ${savedBotMessage.get('id')}`,
        );
      }
      await discordMsg.edit({
        components: [mainContainer],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  }

  /**
   * Send a message if an event start in less than 10 minutes
   *
   * @param guild
   */
  public async maybeSendReadyMessages(guild: Guild) {
    const events = await guild.scheduledEvents.fetch();

    for (const [_eventId, event] of events) {
      await this.maybeSendReadyMessagesForEvent(guild, event);
    }
  }

  /**
   * Send a message if an event start in less than 10 minutes
   *
   * @param guild
   * @param event
   */
  public async maybeSendReadyMessagesForEvent(
    guild: Guild,
    event: GuildScheduledEvent<GuildScheduledEventStatus>,
  ) {
    const savedEvent = await db.ScheduledEvent.findOne({
      where: {
        discordId: event.id,
        name: event.name,
      },
    });

    if (savedEvent === null) {
      throw new Error(`Event ${event.name} not found in database`);
    }

    const readyMessageSent = savedEvent.get('readyMessageSent');
    if (readyMessageSent) {
      console.log(`Event ${event.name}: get ready message already sent`);
      return;
    }

    // check if event start in less than 10 minutes
    const THRESHOLD_MS = 10 * 60 * 1000;
    const startTimeStamp = event.scheduledStartTimestamp ?? 0;
    const startingIn = startTimeStamp - Date.now();
    if (startingIn > THRESHOLD_MS || startingIn < 0) {
      console.debug(
        `Event ${event.name} starting in more than 10 minutes or in the past`,
      );
      return;
    }

    console.log(`Event ${event.name} starting in ${startingIn / 1000} seconds`);
    const components = await this.prepareGetReadyMessage(event);

    await this.send(guild, components);

    // update readyMessageSent
    savedEvent.set('readyMessageSent', true);
    await savedEvent.save();
    console.log(`Event ${event.name}: get ready message sent`);
  }

  /**
   * Send a message
   *
   * @param guild
   * @param components
   */
  public async send(
    guild: Guild,
    components: BaseMessageOptions['components'],
  ) {
    const channel = await this.getChannel(guild);
    return await channel.send({
      components: components,
      flags: MessageFlags.IsComponentsV2,
    });
  }

  /**
   * Prepare a message to send when an event is starting soon
   *
   * @param event
   */
  public async prepareGetReadyMessage(
    event: GuildScheduledEvent<GuildScheduledEventStatus>,
  ) {
    const startTimeStamp = event.scheduledStartTimestamp;
    if (!startTimeStamp) {
      console.warn('Event has no scheduled start timestamp');
      return;
    }

    // format to locale fr-FR in format dd/mm/yyyy hh:mm:ss
    const formattedDate = new Date(startTimeStamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const mainContainer = new ContainerBuilder().setAccentColor(0x0099ff);

    const coverImageURL = event.coverImageURL();

    if (coverImageURL) {
      const sectionBuilder = new SectionBuilder()
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent('# Préparez-vous !'),
        )
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent('## ' + event.name + '\n\n' + formattedDate),
        )
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent("L'événement commence bientôt !"),
        );

      sectionBuilder.setThumbnailAccessory((thumbnail) =>
        thumbnail
          .setDescription('Calendrier FFXIV - Événement: ' + event.name)
          .setURL(coverImageURL),
      );
      mainContainer.addSectionComponents(sectionBuilder);
    } else {
      mainContainer
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent('# Préparez-vous !'),
        )
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent('## ' + event.name + '\n\n' + formattedDate),
        )
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent("L'événement commence bientôt !"),
        );
    }

    mainContainer.addSeparatorComponents((separator) => separator);
    const textDisplay: TextDisplayBuilder = new TextDisplayBuilder();
    const textDisplayContent: string[] = [];
    textDisplayContent.push('## Inscrits :');
    const subscribers = await event.fetchSubscribers();
    for (const [_subscriberId, subscriber] of subscribers) {
      textDisplayContent.push(`<@${subscriber.user.id}>`);
    }
    textDisplay.setContent(textDisplayContent.join('\n'));

    mainContainer.addTextDisplayComponents(textDisplay);

    return [mainContainer];
  }

  on: Client['on'] = (
    event: Parameters<Client['on']>[0],
    listener: Parameters<Client['on']>[1],
  ) => {
    this.nativeReadyClient.on(event, listener);
    return this.nativeReadyClient;
  };

  public async refreshEvents(guild: Guild) {
    guild = await guild.fetch();

    console.log(`Fetching for guild ${guild.name}`);

    await this.prepareAndSendEventRecap(guild);

    await this.maybeSendReadyMessages(guild);

    console.log(`Finished refreshing events for guild ${guild.name}`);
  }

  public async maybeInitData() {
    const guilds = await this.nativeReadyClient.guilds.fetch();

    let mustCreateChannels = false;
    const allSavedChannels = await db.Channel.findAll();
    if (allSavedChannels.length === 0) {
      console.log('No channels found in database. Channels will be created...');
      mustCreateChannels = true;
    }

    for (const [_guildId, lazyGuild] of guilds) {
      console.log(`Processing guild ${lazyGuild.name}`);
      const guild = await lazyGuild.fetch();
      // check if guild exists in database
      let [savedGuild] = await db.Guild.findOrCreate({
        where: {
          discordId: lazyGuild.id,
          name: lazyGuild.name,
        },
      });

      if (mustCreateChannels) {
        const prodName = this.channels[lazyGuild.name]?.prod;
        if (!prodName) {
          throw new Error(
            `No default prod channel for guild ${lazyGuild.name}`,
          );
        }
        const testName = this.channels[lazyGuild.name]?.test;
        if (!testName) {
          throw new Error(
            `No default test channel for guild ${lazyGuild.name}`,
          );
        }

        await db.Channel.create({
          discordId: (await this.findGuildChannel(guild, prodName)).id,
          isProd: true,
          guildId: savedGuild.get('id'),
          name: prodName,
        });
        await db.Channel.create({
          discordId: (await this.findGuildChannel(guild, testName)).id,
          isProd: false,
          guildId: savedGuild.get('id'),
          name: testName,
        });
      }

      const events = await guild.scheduledEvents.fetch();
      console.log(
        `Found events ${events.map((event) => event.name).join(', ')} `,
      );

      for (const [_eventId, event] of events) {
        console.log(`Processing event ${event.name}`);
        await db.ScheduledEvent.findOrCreate({
          where: {
            discordId: event.id,
            name: event.name,
          },
        });
      }

      console.log(`Finished processing guild ${lazyGuild.name}`);
    }
  }
}
