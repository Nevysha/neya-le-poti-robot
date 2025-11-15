import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { GetReadyMessages, GetReadyMessagesId } from '#nlpr/database/models/GetReadyMessages.js';
import type { ScheduledEventMessages, ScheduledEventMessagesId } from '#nlpr/database/models/ScheduledEventMessages.js';

export interface ScheduledEventsAttributes {
  id?: string;
  discordId: string;
  name?: string;
  readyMessageSent?: number;
  hash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ScheduledEventsPk = "id";
export type ScheduledEventsId = ScheduledEvents[ScheduledEventsPk];
export type ScheduledEventsOptionalAttributes = "id" | "name" | "readyMessageSent" | "hash";
export type ScheduledEventsCreationAttributes = Optional<ScheduledEventsAttributes, ScheduledEventsOptionalAttributes>;

export class ScheduledEvents extends Model<ScheduledEventsAttributes, ScheduledEventsCreationAttributes> implements ScheduledEventsAttributes {
  id?: string;
  discordId!: string;
  name?: string;
  readyMessageSent?: number;
  hash?: string;
  createdAt!: Date;
  updatedAt!: Date;

  // ScheduledEvents hasMany GetReadyMessages via scheduledEventId
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
  // ScheduledEvents hasMany ScheduledEventMessages via scheduledEventId
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

  static initModel(sequelize: Sequelize.Sequelize): typeof ScheduledEvents {
    return ScheduledEvents.init({
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
      allowNull: true
    },
    readyMessageSent: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    hash: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'scheduled_events',
    timestamps: false,
    indexes: [
      {
        name: "sqlite_autoindex_scheduled_events_1",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "sqlite_autoindex_scheduled_events_2",
        unique: true,
        fields: [
          { name: "discordId" },
        ]
      },
    ]
  });
  }
}
