"use client";

import { useTheme } from "next-themes";



export function ThemeToggle() {

  const { theme, setTheme } = useTheme();

  const next = theme === "dark" ? "light" : "dark";

  return (

    <button

      onClick={() => setTheme(next)}

      className="rounded-xl border px-3 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"

      aria-label="Toggle theme"

      title="Toggle theme"

    >

      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}

    </button>

  );

}



// (optional) also export default to be future-proof

export default ThemeToggle;

