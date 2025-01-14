import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

export default defineConfig({
	integrations: [tailwind(), react()],
	i18n: {
		locales: ["en", "de", "et", "lt"],
		defaultLocale: "en",
	},
});
