"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/** The IEEE Week pages are dark only. Restores the visitor's own theme on the way out. */
export function useDarkTheme() {
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    const previous = theme;
    setTheme("dark");
    return () => {
      if (previous && previous !== "dark") setTheme(previous);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
