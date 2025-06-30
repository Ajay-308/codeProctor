"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create listener function
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Use modern addEventListener API
    media.addEventListener("change", listener);

    // Cleanup with modern removeEventListener API
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
}
