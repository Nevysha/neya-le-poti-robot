import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BotMessages, BotMessagesId } from '#nlpr/database/models/BotMessages.js';
import type { Guilds, GuildsId } from '#nlpr/database/models/Guilds.js';

export interface ChannelsAttributes {
  id?: string;
  name: string;
  discordId?: string;
  isProd?: number;
  createdAt: Date;
  updatedAt: Date;
  guildId?: string;
}

export type ChannelsPk = "id";
export type ChannelsId = Channels[ChannelsPk];
export type ChannelsOptionalAttributes = "id" | "discordId" | "isProd" | "createdAt" | "updatedAt" | "guildId";
export type ChannelsCreationAttributes = Optional<ChannelsAttributes, ChannelsOptionalAttributes>;

export class Channels extends Model<ChannelsAttributes, ChannelsCreationAttributes> implements ChannelsAttributes {
  id?: string;
  name!: string;
  discordId?: string;
  isProd?: number;
  createdAt!: Date;
  updatedAt!: Date;
  guildId?: string;

  // Channels hasMany BotMessages via channelId
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
  // Channels belongsTo Guilds via guildId
  guild!: Guilds;
  getGuild!: Sequelize.BelongsToGetAssociationMixin<Guilds>;
  setGuild!: Sequelize.BelongsToSetAssociationMixin<Guilds, GuildsId>;
  createGuild!: Sequelize.BelongsToCreateAssociationMixin<Guilds>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Channels {
    return Channels.init({
    id: {
      type: DataTypes.UUID,
      allowNull: true,
      primaryKey: true,
      unique: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    discordId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isProd: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    guildId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'guilds',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'channels',
    timestamps: true,
    indexes: [
      {
        name: "sqlite_autoindex_channels_1",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
