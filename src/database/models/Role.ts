import { NevyModel } from '@nlpr/database/models/NevyModel.ts';
import { Sequelize, DataTypes as SequelizeDataTypes } from 'sequelize';

const Role = (sequelize: Sequelize, DataTypes: typeof SequelizeDataTypes) => {
  class Role extends NevyModel {
    defineAssociation(models: NevyModel[]) {
      // define association here
    }
  }
  Role.init(
    {
      name: DataTypes.STRING,
      discordId: DataTypes.STRING,
      id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'Role',
    },
  );
  return Role;
};

export default Role;
