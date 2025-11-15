import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Guilds, GuildsId } from '#nlpr/database/models/Guilds.js';
import type { ScheduledEvents, ScheduledEventsId } from '#nlpr/database/models/ScheduledEvents.js';

export interface GetReadyMessagesAttributes {
  id?: string;
  discordId: string;
  createdAt: Date;
  updatedAt: Date;
  guildId?: string;
  scheduledEventId?: string;
}

export type GetReadyMessagesPk = "id";
export type GetReadyMessagesId = GetReadyMessages[GetReadyMessagesPk];
export type GetReadyMessagesOptionalAttributes = "id" | "createdAt" | "updatedAt" | "guildId" | "scheduledEventId";
export type GetReadyMessagesCreationAttributes = Optional<GetReadyMessagesAttributes, GetReadyMessagesOptionalAttributes>;

export class GetReadyMessages extends Model<GetReadyMessagesAttributes, GetReadyMessagesCreationAttributes> implements GetReadyMessagesAttributes {
  id?: string;
  discordId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  guildId?: string;
  scheduledEventId?: string;

  // GetReadyMessages belongsTo Guilds via guildId
  guild!: Guilds;
  getGuild!: Sequelize.BelongsToGetAssociationMixin<Guilds>;
  setGuild!: Sequelize.BelongsToSetAssociationMixin<Guilds, GuildsId>;
  createGuild!: Sequelize.BelongsToCreateAssociationMixin<Guilds>;
  // GetReadyMessages belongsTo ScheduledEvents via scheduledEventId
  scheduledEvent!: ScheduledEvents;
  getScheduledEvent!: Sequelize.BelongsToGetAssociationMixin<ScheduledEvents>;
  setScheduledEvent!: Sequelize.BelongsToSetAssociationMixin<ScheduledEvents, ScheduledEventsId>;
  createScheduledEvent!: Sequelize.BelongsToCreateAssociationMixin<ScheduledEvents>;

  static initModel(sequelize: Sequelize.Sequelize): typeof GetReadyMessages {
    return GetReadyMessages.init({
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
    guildId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'guilds',
        key: 'id'
      }
    },
    scheduledEventId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'scheduled_events',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'get_ready_messages',
    timestamps: true,
    indexes: [
      {
        name: "sqlite_autoindex_get_ready_messages_1",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "sqlite_autoindex_get_ready_messages_2",
        unique: true,
        fields: [
          { name: "discordId" },
        ]
      },
    ]
  });
  }
}
