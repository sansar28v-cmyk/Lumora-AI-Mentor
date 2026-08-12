import { createContext, useContext, useEffect, type ReactNode } from "react";

type Theme = "light";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }>({
  theme: "light",
  toggle: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
      try {
        localStorage.removeItem("sp-theme");
      } catch {}
    }
  }, []);

  const value = {
    theme: "light" as const,
    setTheme: () => {},
    toggle: () => {},
  };

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
