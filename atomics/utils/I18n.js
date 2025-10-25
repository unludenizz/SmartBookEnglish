import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import tr from './translations/tr';
import en from './translations/en';
import de from './translations/de';
import es from './translations/es';
import fr from './translations/fr';
import it from './translations/it';




const i18n = new I18n({
  tr,
  en,
  de,
  es,
  fr,
  it
});



i18n.enableFallback = true;


export default i18n;
