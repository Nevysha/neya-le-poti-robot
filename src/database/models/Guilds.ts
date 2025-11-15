import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BotMessages, BotMessagesId } from '#nlpr/database/models/BotMessages.js';
import type { Channels, ChannelsId } from '#nlpr/database/models/Channels.js';
import type { GetReadyMessages, GetReadyMessagesId } from '#nlpr/database/models/GetReadyMessages.js';
import type { ScheduledEventMessages, ScheduledEventMessagesId } from '#nlpr/database/models/ScheduledEventMessages.js';

export interface GuildsAttributes {
  id?: string;
  discordId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type GuildsPk = "id";
export type GuildsId = Guilds[GuildsPk];
export type GuildsOptionalAttributes = "id" | "createdAt" | "updatedAt";
export type GuildsCreationAttributes = Optional<GuildsAttributes, GuildsOptionalAttributes>;

export class Guilds extends Model<GuildsAttributes, GuildsCreationAttributes> implements GuildsAttributes {
  id?: string;
  discordId!: string;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;

  // Guilds hasMany BotMessages via guildId
  botMessages!: BotMessages[];
  getBotMessages!: Sequelize.HasManyGetAssociationsMixin<BotMessages>;
  setBotMessages!: Sequelize.HasManySetAssociationsMixin<BotMessages, BotMessagesId>;
  addBotMessage!: Sequelize.HasManyAddAssociationMixin<BotMessages, BotMessagesId>;
  addBotMessages!: Sequelize.HasManyAddAssociationsMixin<BotMessages, BotMessagesId>;
  createBotMessage!: Sequelize.HasManyCreateAssociationMixin<BotMessages>;
  removeBotMessage!: Sequelize.HasManyRemoveAssociationMixin<BotMessages, BotMessagesId>;
  removeBotMessages!: Sequelize.HasManyRemoveAssociationsMixin<BotMessages, BotMessagesId>;
  hasBotMessage!: Sequelize.HasManyHasAssociationMixin<BotMessages, BotMessagesId>;
  hasBotMessages!: Sequelize.HasManyHasAssociationsMixin<BotMessages, BotMessagesId>;
  countBotMessages!: Sequelize.HasManyCountAssociationsMixin;
  // Guilds hasMany Channels via guildId
  channels!: Channels[];
  getChannels!: Sequelize.HasManyGetAssociationsMixin<Channels>;
  setChannels!: Sequelize.HasManySetAssociationsMixin<Channels, ChannelsId>;
  addChannel!: Sequelize.HasManyAddAssociationMixin<Channels, ChannelsId>;
  addChannels!: Sequelize.HasManyAddAssociationsMixin<Channels, ChannelsId>;
  createChannel!: Sequelize.HasManyCreateAssociationMixin<Channels>;
  removeChannel!: Sequelize.HasManyRemoveAssociationMixin<Channels, ChannelsId>;
  removeChannels!: Sequelize.HasManyRemoveAssociationsMixin<Channels, ChannelsId>;
  hasChannel!: Sequelize.HasManyHasAssociationMixin<Channels, ChannelsId>;
  hasChannels!: Sequelize.HasManyHasAssociationsMixin<Channels, ChannelsId>;
  countChannels!: Sequelize.HasManyCountAssociationsMixin;
  // Guilds hasMany GetReadyMessages via guildId
  getReadyMessages!: GetReadyMessages[];
  getGetReadyMessages!: Sequelize.HasManyGetAssociationsMixin<GetReadyMessages>;
  setGetReadyMessages!: Sequelize.HasManySetAssociationsMixin<GetReadyMessages, GetReadyMessagesId>;
  addGetReadyMessage!: Sequelize.HasManyAddAssociationMixin<GetReadyMessages, GetReadyMessagesId>;
  addGetReadyMessages!: Sequelize.HasManyAddAssociationsMixin<GetReadyMessages, GetReadyMessagesId>;
  createGetReadyMessage!: Sequelize.HasManyCreateAssociationMixin<GetReadyMessages>;
  removeGetReadyMessage!: Sequelize.HasManyRemoveAssociationMixin<GetReadyMessages, GetReadyMessagesId>;
  removeGetReadyMessages!: Sequelize.HasManyRemoveAssociationsMixin<GetReadyMessages, GetReadyMessagesId>;
  hasGetReadyMessage!: Sequelize.HasManyHasAssociationMixin<GetReadyMessages, GetReadyMessagesId>;
  hasGetReadyMessages!: Sequelize.HasManyHasAssociationsMixin<GetReadyMessages, GetReadyMessagesId>;
  countGetReadyMessages!: Sequelize.HasManyCountAssociationsMixin;
  // Guilds hasMany ScheduledEventMessages via guildId
  scheduledEventMessages!: ScheduledEventMessages[];
  getScheduledEventMessages!: Sequelize.HasManyGetAssociationsMixin<ScheduledEventMessages>;
  setScheduledEventMessages!: Sequelize.HasManySetAssociationsMixin<ScheduledEventMessages, ScheduledEventMessagesId>;
  addScheduledEventMessage!: Sequelize.HasManyAddAssociationMixin<ScheduledEventMessages, ScheduledEventMessagesId>;
  addScheduledEventMessages!: Sequelize.HasManyAddAssociationsMixin<ScheduledEventMessages, ScheduledEventMessagesId>;
  createScheduledEventMessage!: Sequelize.HasManyCreateAssociationMixin<ScheduledEventMessages>;
  removeScheduledEventMessage!: Sequelize.HasManyRemoveAssociationMixin<ScheduledEventMessages, ScheduledEventMessagesId>;
  removeScheduledEventMessages!: Sequelize.HasManyRemoveAssociationsMixin<ScheduledEventMessages, ScheduledEventMessagesId>;
  hasScheduledEventMessage!: Sequelize.HasManyHasAssociationMixin<ScheduledEventMessages, ScheduledEventMessagesId>;
  hasScheduledEventMessages!: Sequelize.HasManyHasAssociationsMixin<ScheduledEventMessages, ScheduledEventMessagesId>;
  countScheduledEventMessages!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Guilds {
    return Guilds.init({
    id: {
      type: DataTypes.UUID,
      allowNull: true,
      primaryKey: true,
      unique: true
    },
    discordId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'guilds',
    timestamps: true,
    indexes: [
      {
        name: "sqlite_autoindex_guilds_1",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "sqlite_autoindex_guilds_2",
        unique: true,
        fields: [
          { name: "discordId" },
        ]
      },
    ]
  });
  }
}
