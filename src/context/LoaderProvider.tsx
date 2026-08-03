"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";

type LoaderState = {
  /** true until the preloader has fully handed off to the page */
  isLoading: boolean;
  /** true once the globe has settled — hero content may start animating */
  isRevealing: boolean;
  startReveal: () => void;
  finish: () => void;
};

const LoaderContext = createContext<LoaderState>({
  isLoading: false,
  isRevealing: false,
  startReveal: () => {},
  finish: () => {},
});

export const useLoader = () => useContext(LoaderContext);

export default function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealing, setIsRevealing] = useState(false);

  const startReveal = useCallback(() => setIsRevealing(true), []);
  const finish = useCallback(() => {
    setIsRevealing(true);
    setIsLoading(false);
  }, []);

  const value = useMemo(
    () => ({ isLoading, isRevealing, startReveal, finish }),
    [isLoading, isRevealing, startReveal, finish]
  );

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
}
