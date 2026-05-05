import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.boufet.app',
  appName: 'Boufet',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://boufet.com/driver'
  }
};

export default config;
