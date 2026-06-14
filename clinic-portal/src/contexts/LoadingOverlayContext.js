"use client";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const Ctx = createContext({ show: () => {}, hide: () => {}, busy: false });

export function LoadingOverlayProvider({ children }) {
  const [busy, setBusy] = useState(false);
  const counter = useRef(0);

  const show = useCallback(() => {
    counter.current += 1;
    setBusy(true);
  }, []);

  const hide = useCallback(() => {
    counter.current = Math.max(0, counter.current - 1);
    if (counter.current === 0) setBusy(false);
  }, []);

  const value = useMemo(() => ({ show, hide, busy }), [show, hide, busy]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLoadingOverlay() {
  return useContext(Ctx);
}

