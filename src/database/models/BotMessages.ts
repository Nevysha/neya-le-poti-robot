import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Channels, ChannelsId } from '#nlpr/database/models/Channels.js';
import type { Guilds, GuildsId } from '#nlpr/database/models/Guilds.js';
import type { ScheduledEventMessages, ScheduledEventMessagesId } from '#nlpr/database/models/ScheduledEventMessages.js';

export interface BotMessagesAttributes {
  id?: string;
  discordId: string;
  createdAt: Date;
  updatedAt: Date;
  guildId?: string;
  channelId?: string;
}

export type BotMessagesPk = "id";
export type BotMessagesId = BotMessages[BotMessagesPk];
export type BotMessagesOptionalAttributes = "id" | "guildId" | "channelId";
export type BotMessagesCreationAttributes = Optional<BotMessagesAttributes, BotMessagesOptionalAttributes>;

export class BotMessages extends Model<BotMessagesAttributes, BotMessagesCreationAttributes> implements BotMessagesAttributes {
  id?: string;
  discordId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  guildId?: string;
  channelId?: string;

  // BotMessages hasMany ScheduledEventMessages via botMessageId
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
  // BotMessages belongsTo Channels via channelId
  channel!: Channels;
  getChannel!: Sequelize.BelongsToGetAssociationMixin<Channels>;
  setChannel!: Sequelize.BelongsToSetAssociationMixin<Channels, ChannelsId>;
  createChannel!: Sequelize.BelongsToCreateAssociationMixin<Channels>;
  // BotMessages belongsTo Guilds via guildId
  guild!: Guilds;
  getGuild!: Sequelize.BelongsToGetAssociationMixin<Guilds>;
  setGuild!: Sequelize.BelongsToSetAssociationMixin<Guilds, GuildsId>;
  createGuild!: Sequelize.BelongsToCreateAssociationMixin<Guilds>;

  static initModel(sequelize: Sequelize.Sequelize): typeof BotMessages {
    return BotMessages.init({
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    guildId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'guilds',
        key: 'id'
      }
    },
    channelId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'channels',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'bot_messages',
    timestamps: false,
    indexes: [
      {
        name: "sqlite_autoindex_bot_messages_1",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "sqlite_autoindex_bot_messages_2",
        unique: true,
        fields: [
          { name: "discordId" },
        ]
      },
    ]
  });
  }
}
