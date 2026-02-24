import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

/** Light tap — for button presses, tab switches */
export const hapticsLight = async () => {
  if (!isNative) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Silently fail on unsupported platforms
  }
};

/** Medium tap — for important actions like starting a dive */
export const hapticsMedium = async () => {
  if (!isNative) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
};

/** Success notification — for mission complete */
export const hapticsSuccess = async () => {
  if (!isNative) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {}
};

/** Warning notification — for emergency ascent */
export const hapticsWarning = async () => {
  if (!isNative) return;
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch {}
};
