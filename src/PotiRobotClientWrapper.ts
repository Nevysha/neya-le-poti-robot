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

export type TEnv = {
  DISCORD_TOKEN: string;
  IS_TEST: string;
  APP_ID: string;
};

/**
 * Wrapper around the native discord client to add some features
 */
export class PotiRobotClientWrapper {
  /**
   * Constructor
   *
   * @param env
   * @param nativeReadyClient
   */
  constructor(
    private env: TEnv,
    public nativeReadyClient: Client<true>,
  ) {}

  /**
   * Bootstrap and Start the client
   *
   * @param env
   */
  static async start(env: TEnv): Promise<PotiRobotClientWrapper> {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    return new Promise(async (resolve, reject) => {
      try {
        client.once(Events.ClientReady, async (readyClient) => {
          console.log(`Ready! Logged in as ${readyClient.user.tag}`);
          resolve(new PotiRobotClientWrapper(env, readyClient));
        });
        await client.login(env.DISCORD_TOKEN);
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
    if (!this.env.IS_TEST) {
      return;
    }

    console.log(`Clearing messages for guild ${guild.name}`);

    try {
      const channel = await this.getChannel(guild);
      await channel.messages.fetch();
      await channel.bulkDelete(channel.messages.cache);
    } catch (error) {
      console.error(error);
      return;
    }
  }

  /**
   * Get a valid channel to send messages
   *
   * @param guild
   */
  public async getChannel(guild: Guild) {
    // collecting channels
    const channels = await guild.channels.fetch();
    // get calendrier-ffxiv-test or calendrier-ffxiv
    const channelName =
      this.env.IS_TEST === 'true' ?
        'calendrier-ffxiv-test'
      : 'calendrier-ffxiv';
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
    const events = await guild.scheduledEvents.fetch();
    console.log(
      `Found events ${events.map((event) => event.name).join(', ')} `,
    );

    const components = [];

    for (const [_eventId, event] of events) {
      const subscribers = await event.fetchSubscribers();

      const startTimeStamp = event.scheduledStartTimestamp;
      if (!startTimeStamp) {
        console.warn('Event has no scheduled start timestamp');
        return;
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

      const sectionBuilder = new SectionBuilder()
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent('# ' + event.name + '\n\n' + formattedDate),
        )
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent(event.url),
        );
      const coverImageURL = event.coverImageURL();

      if (coverImageURL) {
        sectionBuilder.setThumbnailAccessory((thumbnail) =>
          thumbnail
            .setDescription('Calendrier FFXIV - Événement: ' + event.name)
            .setURL(coverImageURL),
        );
      }

      mainContainer.addSectionComponents(sectionBuilder);

      mainContainer.addSeparatorComponents((separator) => separator);
      const textDisplay: TextDisplayBuilder = new TextDisplayBuilder();
      const textDisplayContent: string[] = [];
      textDisplayContent.push('## Inscrits :');
      for (const [_subscriberId, subscriber] of subscribers) {
        textDisplayContent.push(`- ${subscriber.user.displayName}`);
      }
      textDisplay.setContent(textDisplayContent.join('\n'));

      mainContainer.addTextDisplayComponents(textDisplay);

      components.push(mainContainer);
    }

    if (components.length > 0) {
      await this.send(guild, components);
    }
  }

  /**
   * Send a message if an event start in less than 10 minutes
   *
   * @param guild
   */
  public async maybeSendReadyMessages(guild: Guild) {
    const events = await guild.scheduledEvents.fetch();
    console.log(
      `Found events ${events.map((event) => event.name).join(', ')} `,
    );

    for (const [_eventId, event] of events) {
      await this.maybeSendReadyMessagesForEvent(guild, event);
    }
  }

  /**
   * Send a message if an event start in less than 10 minutes
   *
   * @param guild
   * @param event
   * @param force
   */
  public async maybeSendReadyMessagesForEvent(
    guild: Guild,
    event: GuildScheduledEvent<GuildScheduledEventStatus>,
    force: boolean = false,
  ) {
    const subscribers = await event.fetchSubscribers();
    console.log(
      `Event: ${event.name} - Subscribers: ${subscribers.map((sub) => sub.user.tag).join(',')}`,
    );

    // check if event start in less than 10 minutes
    const THRESHOLD_MS = 10 * 60 * 1000;
    const startTimeStamp = event.scheduledStartTimestamp ?? 0;
    console.log(
      `Event ${event.name} starting in ${(startTimeStamp - Date.now()) / 1000} seconds`,
    );
    if (startTimeStamp - Date.now() > THRESHOLD_MS && !force) {
      console.log(`Event ${event.name} starting in more than 10 minutes`);
      return;
    }

    const components = await this.prepareGetReadyMessage(event);

    await this.send(guild, components);
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
    try {
      const channel = await this.getChannel(guild);
      await channel.send({
        components: components,
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      console.error(error);
      return;
    }
  }

  /**
   * Prepare a message to send when an event is starting soon
   *
   * @param event
   */
  public async prepareGetReadyMessage(
    event: GuildScheduledEvent<GuildScheduledEventStatus>,
  ) {
    const subscribers = await event.fetchSubscribers();

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
    const coverImageURL = event.coverImageURL();

    if (coverImageURL) {
      sectionBuilder.setThumbnailAccessory((thumbnail) =>
        thumbnail
          .setDescription('Calendrier FFXIV - Événement: ' + event.name)
          .setURL(coverImageURL),
      );
    }

    mainContainer.addSectionComponents(sectionBuilder);

    mainContainer.addSeparatorComponents((separator) => separator);
    const textDisplay: TextDisplayBuilder = new TextDisplayBuilder();
    const textDisplayContent: string[] = [];
    textDisplayContent.push('## Inscrits :');
    for (const [_subscriberId, subscriber] of subscribers) {
      textDisplayContent.push(`<@${subscriber.user.id}>`);
    }
    textDisplay.setContent(textDisplayContent.join('\n'));

    mainContainer.addTextDisplayComponents(textDisplay);

    return [mainContainer];
  }
}
