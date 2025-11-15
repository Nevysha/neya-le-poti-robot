import Channel from '@nlpr/database/models/Channel.ts';
import { NevyModel } from '@nlpr/database/models/NevyModel.ts';
import { Sequelize, DataTypes as SequelizeDataTypes } from 'sequelize';

const Guild = (sequelize: Sequelize, DataTypes: typeof SequelizeDataTypes) => {
  class Guild extends NevyModel {
    defineAssociation(models: NevyModel[]) {
      // define association here
    }

    associateWithChannel(ChannelModel: typeof Channel) {
      this.hasMany(ChannelModel);
    }
  }
  Guild.init(
    {
      name: DataTypes.STRING,
      discordId: DataTypes.STRING,
      id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'Guild',
    },
  );
  return Guild;
};

export default Guild;
