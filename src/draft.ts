import { Logger } from '#nlpr/Logger.ts';
import { format } from 'date-fns/format';
import { fr } from 'date-fns/locale';

(() => {
  const formattedDate = format(new Date(), 'PPPPp', { locale: fr });
  Logger.info(formattedDate);
})();
