import i18next from "i18next";
import { getPreferedLanguage, SUPPORTED_LANGUAGES } from "../utils/language";
import * as da from "./locales/da.json";
import * as de from "./locales/de.json";
import * as el from "./locales/el.json";
import * as en from "./locales/en.json";
import * as es from "./locales/es.json";
import * as et from "./locales/et.json";
import * as fi from "./locales/fi.json";
import * as fr from "./locales/fr.json";
import * as hu from "./locales/hu.json";
import * as it from "./locales/it.json";
import * as lt from "./locales/lt.json";
import * as mr from "./locales/mr.json";
import * as pl from "./locales/pl.json";
import * as ru from "./locales/ru.json";
import * as sv from "./locales/sv.json";
import * as uk from "./locales/uk.json";

await i18next.init({
	lng: getPreferedLanguage(),
	supportedLngs: SUPPORTED_LANGUAGES,
	resources: {
		da,
		de,
		el,
		en,
		es,
		et,
		fi,
		fr,
		hu,
		it,
		lt,
		mr,
		pl,
		ru,
		sv,
		uk,
	},
	defaultNS: "default",
});

export default i18next;
