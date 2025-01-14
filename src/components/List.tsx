export function Enumeration({ array }: { array: string[] } & Intl.ListFormatOptions) {
	const language = typeof navigator !== "undefined" ? navigator.language : "en";
	return <>{new Intl.ListFormat(language, { type: "disjunction" }).format(array)}</>;
}
