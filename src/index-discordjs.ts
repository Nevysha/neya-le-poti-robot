import {Client, GuildManager, Options, REST, Routes, GatewayIntentBits, Events, TextDisplayBuilder} from 'discord.js';
import dotenv from 'dotenv'

const env = dotenv.config({ path: '.env' }).parsed as { [key: string]: string };

async function refreshCommands() {
  const rest = new REST({version: '10'}).setToken(env.DISCORD_TOKEN);

  const commands = [
    {
      name: 'ping',
      description: 'Replies with Pong!',
    },
  ];

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(env.APP_ID), {body: commands});

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

(async () => {
  await refreshCommands();

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    const guildManager = readyClient.guilds;
    const lazyGuilds = await guildManager.fetch();
    for (const [guildId, lazyGuild] of lazyGuilds) {
      const guild = await lazyGuild.fetch();
      console.log(`Fetching for guild ${guild.name}`);

      // collecting channels
      const channels = await guild.channels.fetch();
      console.log(channels)
      // get calendrier-ffxiv-test or calendrier-ffxiv
      const channelName = env.IS_TEST === "true" ? 'calendrier-ffxiv-test' : 'calendrier-ffxiv';

      // collecting event
      const events = await guild.scheduledEvents.fetch();
      console.log(events)

      for (const [eventId, event] of events) {
        const subscribers = await event.fetchSubscribers();
        console.log(`Event: ${event.name} - Subscribers:`, subscribers);

        const exampleTextDisplay = new TextDisplayBuilder().setContent(
          'Event: ' + event.name + ' - Subscribers: ' + subscribers.map(sub => sub.user.tag).join(', ')
        );
      }
    }
  })

  // Log in to Discord with your client's token
  await client.login(env.DISCORD_TOKEN);

  console.log('bootstraped')
})()