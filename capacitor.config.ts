import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.memematch.app',
  appName: 'MemeMatch',
  webDir: 'dist',
  server: {
    // 🔥 OTA Updates: WebView loads from Firebase Hosting.
    // Users always get the latest version on next app open — no Play Store update needed.
    // Only rebuild & republish APK when you add new native Capacitor plugins.
    url: 'https://atlantean-return-jnmq3.web.app',
    cleartext: false
  }
};

export default config;
