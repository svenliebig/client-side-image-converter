import { useState } from "react";
import i18next from "../i18n/i18n";
import { LANGUAGES, setLanguage } from "../utils/language";
import { rerenderStore } from "../utils/rerender-store";

export const LanguageToggle = () => {
	const [language, setLang] = useState(() => {
		return i18next.language;
	});

	return (
		<select
			value={language}
			onChange={({ target: { value } }) => {
				setLang(value);
				setLanguage(value);
				i18next.changeLanguage(value);
				rerenderStore.emit();
			}}
			className="fixed top-4 left-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-800 cursor-pointer"
		>
			{LANGUAGES.map((lang) => (
				<option key={lang.value} value={lang.value} aria-label={lang.label} title={lang.label}>
					{lang.emoji}
				</option>
			))}
		</select>
	);
};
