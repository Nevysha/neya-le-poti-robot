import dotenv from "dotenv";
import { Command } from "commander";

const env = dotenv.config({ path: '.env' }).parsed as { [key: string]: string };

const events = async () => {
  const events = await (await fetch(`https://discord.com/api/v10/guilds/${env.GUILD_ID}/scheduled-events`, {
    method: 'GET',
    headers: {
      'Authorization': `Bot ${env.DISCORD_TOKEN}`
    }
  } )).json();
  console.log(events)

  // /guilds/{guild.id}/scheduled-events/{guild_scheduled_event.id}/users
  for (const event of events) {
    console.log(event)

    const subscribedUsers = await (await fetch('https://discord.com/api/v10/guilds/' + env.GUILD_ID + '/scheduled-events/' + event.id + '/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bot ${env.DISCORD_TOKEN}`
      }
    })).json();

    console.log(`Event: ${event.name} - Subscribed Users:`, subscribedUsers);
  }
};

const message = async () => {
  // test sending a message to the channel #calendrier-ffxiv-test
  const channels = await (await fetch('https://discord.com/api/v10/guilds/' + env.GUILD_ID + '/channels', {
    method: 'GET',
    headers: {
      'Authorization': `Bot ${env.DISCORD_TOKEN}`
    }
  })).json();

  // search for the channel
  const channel = channels.find(channel => channel.name === 'calendrier-ffxiv-test');
  console.log(channel)

  const message = await (await fetch('https://discord.com/api/v10/channels/' + channel.id + '/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: 'Blep!'
    })
  }))
}


const program = new Command();
program.command('events').action(events);
program.command('message').action(message);
program.parse();