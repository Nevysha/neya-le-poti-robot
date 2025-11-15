import { NevyModel } from '#nlpr/database/models/NevyModel.js';
import { Sequelize, DataTypes as SequelizeDataTypes } from 'sequelize';

const Channel = (
  sequelize: Sequelize,
  DataTypes: typeof SequelizeDataTypes,
) => {
  class Channel extends NevyModel {
    defineAssociation(models: NevyModel[]) {
      // define association here
    }
  }
  Channel.init(
    {
      name: DataTypes.STRING,
      discordId: DataTypes.STRING,
      id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'Channel',
    },
  );
  return Channel;
};

export default Channel;
