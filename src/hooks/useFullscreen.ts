import { useState, useEffect, useCallback } from "react";

// Vendor-prefixed fullscreen API surface (Safari/iOS).
// Narrow typing isolates the only place we need `any`-equivalents.
type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};
type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const doc = document as FullscreenDocument;
    const handleChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
    };
  }, []);

  const enterFullscreen = useCallback(async () => {
    const el = document.documentElement as FullscreenElement;
    const fsPromise = el.requestFullscreen
      ? el.requestFullscreen()
      : el.webkitRequestFullscreen?.();

    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 150);

    try { await fsPromise; } catch { /* silent */ }
  }, []);

  const exitFullscreen = useCallback(async () => {
    const doc = document as FullscreenDocument;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      }
    } catch { /* silent */ }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) exitFullscreen();
    else enterFullscreen();
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return { isFullscreen, showOverlay, toggleFullscreen, exitFullscreen };
}
