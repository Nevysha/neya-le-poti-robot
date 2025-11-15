import { sequelize } from '#nlpr/database/database.ts';
import { initModels } from '#nlpr/database/models/init-models.ts';

const { BotMessages } = initModels(sequelize);

(async () => {
  await sequelize.sync();
  const botMessages = await BotMessages.findAll();
  console.log(botMessages);

  const botMessage = botMessages[0];
  console.log(botMessage.getChannel());
})();
