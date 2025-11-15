import { sequelize } from '#nlpr/database/database.ts';
import { initModels } from '#nlpr/database/models/init-models.ts';

initModels(sequelize);
