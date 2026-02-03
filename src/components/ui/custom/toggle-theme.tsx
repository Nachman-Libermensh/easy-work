"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "../button";
import { Moon, Sun } from "lucide-react";

const ToggleTheme = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      title="שנה מצב תצוגה"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? <Sun /> : <Moon />}
    </Button>
  );
};

export default ToggleTheme;
