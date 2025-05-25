import { presetForms } from "@julr/unocss-preset-forms";
import {
	defineConfig,
	presetIcons,
	presetWind3,
	transformerDirectives,
	transformerVariantGroup,
} from "unocss";

export default defineConfig({
	content: {
		filesystem: ["**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}"],
	},
	presets: [presetWind3({ dark: "media" }), presetIcons(), presetForms()],
	transformers: [transformerDirectives(), transformerVariantGroup()],
	safelist: [
		"no-underline",
		"inline-flex",
		"items-center",
		"gap-1",
		"font-medium",
		"!text-blue-600",
		"dark:text-blue-500",
		"bg-blue-700 bg-opacity-10",
		"rounded-lg",
		"px-1",
		"bg-red-500",
		"bg-orange-400",
		"bg-stone-400",
		"text-white",
		"dark:bg-stone-700",
	],
});
