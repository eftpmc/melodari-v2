"use client";

import { useEffect, useState } from "react";

const Logo = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Get the current theme from the document's data-theme attribute
    const currentTheme = document.documentElement.getAttribute("data-theme");
    setTheme(currentTheme || "light");
    
    // Listen for changes in the theme
    const observer = new MutationObserver(() => {
      const updatedTheme = document.documentElement.getAttribute("data-theme");
      setTheme(updatedTheme || "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-row items-center">
      <img
        src={theme === "dark" ? "/ml.png" : "/m.png"}
        alt="Melodari Logo"
        className="h-12 w-12"
      />
    </div>
  );
};

export default Logo;
