import React, { useEffect, useState } from "react";

export const ThemeToggle = () => {
	const [theme, setTheme] = useState(() => {
		if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {
			return localStorage.getItem("theme");
		}
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	});

	useEffect(() => {
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
		localStorage.setItem("theme", theme || "light");
	}, [theme]);

	return (
		<button
			onClick={() => setTheme(theme === "light" ? "dark" : "light")}
			className="fixed top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-800"
		>
			{theme === "light" ? "🌙" : "☀️"}
		</button>
	);
};
