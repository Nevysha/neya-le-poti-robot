import path from 'node:path';
import { DataTypes, Sequelize } from 'sequelize';
import { PotiRobotClientWrapper } from './PotiRobotClientWrapper.ts';

const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'database.sqlite',
});

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
});

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

export const db = {
  sequelize,
  Guild,
  Channel,
  ScheduledEvent,
  BotMessage,
  ScheduledEventMessage,
};

export const databaseInit = async () => {
  await sequelize.sync();

  return {
    sequelize,
    Guild,
    Channel,
    ScheduledEvent,
    BotMessage,
    ScheduledEventMessage,
  };
};

// check if file is being executed directly
const execPath = path.resolve(process.argv[1]);
if (execPath.endsWith('database.ts')) {
  console.log('Running database.ts');
  (async () => {
    await databaseInit();

    // if (Env.RESET_DB) {
    console.log('Resetting database');
    await sequelize.sync({ force: true });
    // }

    const clientWrapper: PotiRobotClientWrapper =
      await PotiRobotClientWrapper.start();
    await clientWrapper.maybeInitData();
    console.log('Database initialized');
    await clientWrapper.nativeReadyClient.destroy();
  })();
}
