"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-square bg-base-100 hover:bg-primary hover:text-base-100"
    >
      {theme === "light" ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
    </button>
  );
};

export default ThemeSwitcher;