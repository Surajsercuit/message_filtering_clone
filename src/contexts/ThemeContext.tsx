import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "ocean" | "forest" | "sunset";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export const themes: { id: Theme; label: string; preview: string }[] = [
  { id: "light", label: "Light", preview: "hsl(210, 20%, 98%)" },
  { id: "dark", label: "Dark", preview: "hsl(224, 71%, 4%)" },
  { id: "ocean", label: "Ocean", preview: "hsl(210, 50%, 15%)" },
  { id: "forest", label: "Forest", preview: "hsl(150, 30%, 10%)" },
  { id: "sunset", label: "Sunset", preview: "hsl(20, 50%, 12%)" },
];

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("parallel-theme") as Theme) || "light";
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("parallel-theme", t);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "ocean", "forest", "sunset");
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
