export const LANGUAGES = [
	{ label: "English", value: "en", emoji: "🇬🇧" },
	{ label: "Deutsch", value: "de", emoji: "🇩🇪" },
	{ label: "Eesti", value: "et", emoji: "🇪🇪" },
	{ label: "Lietuvių", value: "lt", emoji: "🇱🇹" },
	{ label: "मराठी", value: "mr", emoji: "🇮🇳" },
	{ label: "Polski", value: "pl", emoji: "🇵🇱" },
	{ label: "Français", value: "fr", emoji: "🇫🇷" },
	{ label: "Русский", value: "ru", emoji: "🇷🇺" },
	{ label: "Español", value: "es", emoji: "🇪🇸" },
	{ label: "Italiano", value: "it", emoji: "🇮🇹" },
	{ label: "Ελληνικά", value: "el", emoji: "🇬🇷" },
	{ label: "Magyar", value: "hu", emoji: "🇭🇺" },
	{ label: "Dansk", value: "da", emoji: "🇩🇰" },
	{ label: "Svenska", value: "sv", emoji: "🇸🇪" },
	{ label: "Suomi", value: "fi", emoji: "🇫🇮" },
	{ label: "Українська", value: "uk", emoji: "🇺🇦" },
];

export const SUPPORTED_LANGUAGES = LANGUAGES.map((language) => language.value);

export const LOCAL_STORAGE_KEY = "language";

export function getPreferedLanguage() {
	const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
	if (stored) {
		return stored;
	}
	return navigator.language;
}

export function setLanguage(language: string) {
	console.log("Setting language to", language);
	localStorage.setItem(LOCAL_STORAGE_KEY, language);
	document.querySelector("html")?.setAttribute("lang", language);
}
