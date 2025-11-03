import {Client, Events, GatewayIntentBits} from "discord.js";

class PotiRobotClient extends Client{
  constructor() {
    super({ intents: [GatewayIntentBits.Guilds] });
  }

  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.once(Events.ClientReady, async (readyClient) => {
          resolve(readyClient)
        })
      } catch (error) {
        reject(error)
      }
    })

  }
}