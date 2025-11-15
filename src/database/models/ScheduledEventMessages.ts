import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BotMessages, BotMessagesId } from '#nlpr/database/models/BotMessages.js';
import type { Guilds, GuildsId } from '#nlpr/database/models/Guilds.js';
import type { ScheduledEvents, ScheduledEventsId } from '#nlpr/database/models/ScheduledEvents.js';

export interface ScheduledEventMessagesAttributes {
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  scheduledEventId?: string;
  botMessageId?: string;
  guildId?: string;
}

export type ScheduledEventMessagesPk = "id";
export type ScheduledEventMessagesId = ScheduledEventMessages[ScheduledEventMessagesPk];
export type ScheduledEventMessagesOptionalAttributes = "id" | "scheduledEventId" | "botMessageId" | "guildId";
export type ScheduledEventMessagesCreationAttributes = Optional<ScheduledEventMessagesAttributes, ScheduledEventMessagesOptionalAttributes>;

export class ScheduledEventMessages extends Model<ScheduledEventMessagesAttributes, ScheduledEventMessagesCreationAttributes> implements ScheduledEventMessagesAttributes {
  id?: string;
  createdAt!: Date;
  updatedAt!: Date;
  scheduledEventId?: string;
  botMessageId?: string;
  guildId?: string;

  // ScheduledEventMessages belongsTo BotMessages via botMessageId
  botMessage!: BotMessages;
  getBotMessage!: Sequelize.BelongsToGetAssociationMixin<BotMessages>;
  setBotMessage!: Sequelize.BelongsToSetAssociationMixin<BotMessages, BotMessagesId>;
  createBotMessage!: Sequelize.BelongsToCreateAssociationMixin<BotMessages>;
  // ScheduledEventMessages belongsTo Guilds via guildId
  guild!: Guilds;
  getGuild!: Sequelize.BelongsToGetAssociationMixin<Guilds>;
  setGuild!: Sequelize.BelongsToSetAssociationMixin<Guilds, GuildsId>;
  createGuild!: Sequelize.BelongsToCreateAssociationMixin<Guilds>;
  // ScheduledEventMessages belongsTo ScheduledEvents via scheduledEventId
  scheduledEvent!: ScheduledEvents;
  getScheduledEvent!: Sequelize.BelongsToGetAssociationMixin<ScheduledEvents>;
  setScheduledEvent!: Sequelize.BelongsToSetAssociationMixin<ScheduledEvents, ScheduledEventsId>;
  createScheduledEvent!: Sequelize.BelongsToCreateAssociationMixin<ScheduledEvents>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ScheduledEventMessages {
    return ScheduledEventMessages.init({
    id: {
      type: DataTypes.UUID,
      allowNull: true,
      primaryKey: true,
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
    scheduledEventId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'scheduled_events',
        key: 'id'
      }
    },
    botMessageId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'bot_messages',
        key: 'id'
      }
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
    tableName: 'scheduled_event_messages',
    timestamps: false,
    indexes: [
      {
        name: "sqlite_autoindex_scheduled_event_messages_1",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
