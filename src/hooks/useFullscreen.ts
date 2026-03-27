import { useState, useEffect, useCallback } from "react";

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const enterFullscreen = useCallback(async () => {
    // Fire fullscreen API immediately — don't wait for animations
    const fsPromise = document.documentElement.requestFullscreen
      ? document.documentElement.requestFullscreen()
      : (document.documentElement as any).webkitRequestFullscreen?.();

    // Show flash overlay concurrently (not blocking)
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 150);

    try { await fsPromise; } catch { /* silent */ }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    } catch { /* silent */ }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return { isFullscreen, showOverlay, toggleFullscreen, exitFullscreen };
}
