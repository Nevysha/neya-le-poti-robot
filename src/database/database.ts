import { Env } from '#nlpr/Env.js';
import { Logger } from '#nlpr/Logger.js';
import { PotiRobotClientWrapper } from '#nlpr/PotiRobotClientWrapper.js';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { DataTypes, Options, Sequelize } from 'sequelize';

export const dbConfig = {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'database.sqlite',
} as Options;

export const sequelize = new Sequelize(
  'database',
  'user',
  'password',
  dbConfig,
);

const Guild = sequelize.define('guild', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  discordId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Channel = sequelize.define('channel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  discordId: {
    type: DataTypes.STRING,
  },
  isProd: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});
Channel.belongsTo(Guild);
Guild.hasMany(Channel);

const ScheduledEvent = sequelize.define('scheduled_event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  discordId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  readyMessageSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  /**
   * Hash representing all data of this event, used to check if the event has changed
   * - name,
   * - scheduledStartTimestamp
   * - all subscriber.user.id
   */
  hash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

/**
 * Create a hash representing the event
 *
 * concatenated string of all relevant data and hash with sha256
 *
 * @param name
 * @param scheduledStartTimestamp
 * @param subscribers
 */
export const createScheduledEventHash = ({
  name,
  scheduledStartTimestamp,
  subscribers,
}: {
  name: string;
  scheduledStartTimestamp: number;
  subscribers: string[];
}): string => {
  const dataString = `${name}${scheduledStartTimestamp}${subscribers.join('')}`;
  return createHash('sha256').update(dataString).digest('hex');
};

const BotMessage = sequelize.define('bot_message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  discordId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
BotMessage.belongsTo(Guild);
BotMessage.belongsTo(Channel);
Channel.hasMany(BotMessage);
Guild.hasMany(BotMessage);

const ScheduledEventMessage = sequelize.define('scheduled_event_message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
});
ScheduledEventMessage.belongsTo(ScheduledEvent);
ScheduledEventMessage.belongsTo(BotMessage);
ScheduledEventMessage.belongsTo(Guild);

const GetReadyMessage = sequelize.define('get_ready_message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  discordId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
GetReadyMessage.belongsTo(Guild);
GetReadyMessage.belongsTo(ScheduledEvent);
Guild.hasMany(GetReadyMessage);
ScheduledEvent.hasOne(GetReadyMessage);

const Role = sequelize.define('role', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  discordId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  shouldPingOnNewEvent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});
Role.belongsTo(Guild);
Guild.hasMany(Role);

export const db = {
  sequelize,
  Guild,
  Channel,
  ScheduledEvent,
  BotMessage,
  ScheduledEventMessage,
  Role,
};

export const databaseInit = async () => {
  Logger.info('Sync database');
  await sequelize.sync();
};

// check if file is being executed directly
const execPath = path.resolve(process.argv[1]);
if (execPath.endsWith('database.ts') || execPath.endsWith('database.js')) {
  Logger.info('Running database.js');
  (async () => {
    await databaseInit();

    if (Env.RESET_DB) {
      Logger.info('Resetting database');
      await sequelize.sync({ force: true });
    }

    const clientWrapper: PotiRobotClientWrapper =
      await PotiRobotClientWrapper.start();
    await clientWrapper.maybeInitData();
    Logger.info('Database initialized');
    await clientWrapper.nativeReadyClient.destroy();
  })();
}
