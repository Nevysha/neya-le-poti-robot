import { sequelize } from '#nlpr/database/database.ts';
import { initModels } from '#nlpr/database/models/init-models.ts';
import { Logger } from '#nlpr/Logger.ts';

const { BotMessages } = initModels(sequelize);

(async () => {
  await sequelize.sync();
  const botMessages = await BotMessages.findAll();
  Logger.info(botMessages);

  const botMessage = botMessages[0];
  Logger.info(botMessage.getChannel());
})();
