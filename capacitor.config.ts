import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.memematch.app',
  appName: 'MemeMatch',
  webDir: 'dist',
  server: {
    // 🚀 OTA Updates via GitHub Pages (100% free, no credit card)
    // Users always get the latest version on next app open — no Play Store update needed.
    // Only rebuild APK when adding new native Capacitor plugins.
    url: 'https://karankumar2326.github.io/MemeMatch',
    cleartext: false
  }
};

export default config;

