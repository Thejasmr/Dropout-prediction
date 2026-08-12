"use client";

import { useEffect } from "react";

export function useKeyboardShortcut(key, callback, metaKey = true) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMeta = metaKey ? e.metaKey || e.ctrlKey : true;
      if (isMeta && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, metaKey]);
}
