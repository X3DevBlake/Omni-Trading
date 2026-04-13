/**
 * Omni Haptic Service
 * Provides premium, subtle haptic feedback using the Web Vibration API.
 * Mimics the clean, crisp haptic response of high-end Android devices.
 */
class HapticService {
    /**
     * Light tap: subtle feedback for buttons, links, and typing.
     */
    lightTap() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10); // Ultra-short 10ms pulse
        }
    }

    /**
     * Success: double pulse for confirmations.
     */
    success() {
        if ('vibrate' in navigator) {
            navigator.vibrate([15, 50, 15]);
        }
    }

    /**
     * Warning: medium pulse for errors or warnings.
     */
    warning() {
        if ('vibrate' in navigator) {
            navigator.vibrate(40);
        }
    }
    
    /**
     * Impact: strong pulse for major actions (like takeoff).
     */
    impact() {
        if ('vibrate' in navigator) {
            navigator.vibrate(80);
        }
    }
}

export const haptics = new HapticService();
