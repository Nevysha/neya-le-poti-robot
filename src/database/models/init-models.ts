import type { Sequelize } from "sequelize";
import { BotMessages as _BotMessages } from '#nlpr/database/models/BotMessages.js';
import type { BotMessagesAttributes, BotMessagesCreationAttributes } from '#nlpr/database/models/BotMessages.js';
import { Channels as _Channels } from '#nlpr/database/models/Channels.js';
import type { ChannelsAttributes, ChannelsCreationAttributes } from '#nlpr/database/models/Channels.js';
import { GetReadyMessages as _GetReadyMessages } from '#nlpr/database/models/GetReadyMessages.js';
import type { GetReadyMessagesAttributes, GetReadyMessagesCreationAttributes } from '#nlpr/database/models/GetReadyMessages.js';
import { Guilds as _Guilds } from '#nlpr/database/models/Guilds.js';
import type { GuildsAttributes, GuildsCreationAttributes } from '#nlpr/database/models/Guilds.js';
import { ScheduledEventMessages as _ScheduledEventMessages } from '#nlpr/database/models/ScheduledEventMessages.js';
import type { ScheduledEventMessagesAttributes, ScheduledEventMessagesCreationAttributes } from '#nlpr/database/models/ScheduledEventMessages.js';
import { ScheduledEvents as _ScheduledEvents } from '#nlpr/database/models/ScheduledEvents.js';
import type { ScheduledEventsAttributes, ScheduledEventsCreationAttributes } from '#nlpr/database/models/ScheduledEvents.js';

export {
  _BotMessages as BotMessages,
  _Channels as Channels,
  _GetReadyMessages as GetReadyMessages,
  _Guilds as Guilds,
  _ScheduledEventMessages as ScheduledEventMessages,
  _ScheduledEvents as ScheduledEvents,
};

export type {
  BotMessagesAttributes,
  BotMessagesCreationAttributes,
  ChannelsAttributes,
  ChannelsCreationAttributes,
  GetReadyMessagesAttributes,
  GetReadyMessagesCreationAttributes,
  GuildsAttributes,
  GuildsCreationAttributes,
  ScheduledEventMessagesAttributes,
  ScheduledEventMessagesCreationAttributes,
  ScheduledEventsAttributes,
  ScheduledEventsCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const BotMessages = _BotMessages.initModel(sequelize);
  const Channels = _Channels.initModel(sequelize);
  const GetReadyMessages = _GetReadyMessages.initModel(sequelize);
  const Guilds = _Guilds.initModel(sequelize);
  const ScheduledEventMessages = _ScheduledEventMessages.initModel(sequelize);
  const ScheduledEvents = _ScheduledEvents.initModel(sequelize);

  ScheduledEventMessages.belongsTo(BotMessages, { as: "botMessage", foreignKey: "botMessageId"});
  BotMessages.hasMany(ScheduledEventMessages, { as: "scheduledEventMessages", foreignKey: "botMessageId"});
  BotMessages.belongsTo(Channels, { as: "channel", foreignKey: "channelId"});
  Channels.hasMany(BotMessages, { as: "botMessages", foreignKey: "channelId"});
  BotMessages.belongsTo(Guilds, { as: "guild", foreignKey: "guildId"});
  Guilds.hasMany(BotMessages, { as: "botMessages", foreignKey: "guildId"});
  Channels.belongsTo(Guilds, { as: "guild", foreignKey: "guildId"});
  Guilds.hasMany(Channels, { as: "channels", foreignKey: "guildId"});
  GetReadyMessages.belongsTo(Guilds, { as: "guild", foreignKey: "guildId"});
  Guilds.hasMany(GetReadyMessages, { as: "getReadyMessages", foreignKey: "guildId"});
  ScheduledEventMessages.belongsTo(Guilds, { as: "guild", foreignKey: "guildId"});
  Guilds.hasMany(ScheduledEventMessages, { as: "scheduledEventMessages", foreignKey: "guildId"});
  GetReadyMessages.belongsTo(ScheduledEvents, { as: "scheduledEvent", foreignKey: "scheduledEventId"});
  ScheduledEvents.hasMany(GetReadyMessages, { as: "getReadyMessages", foreignKey: "scheduledEventId"});
  ScheduledEventMessages.belongsTo(ScheduledEvents, { as: "scheduledEvent", foreignKey: "scheduledEventId"});
  ScheduledEvents.hasMany(ScheduledEventMessages, { as: "scheduledEventMessages", foreignKey: "scheduledEventId"});

  return {
    BotMessages: BotMessages,
    Channels: Channels,
    GetReadyMessages: GetReadyMessages,
    Guilds: Guilds,
    ScheduledEventMessages: ScheduledEventMessages,
    ScheduledEvents: ScheduledEvents,
  };
}
