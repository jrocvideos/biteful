import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biteful.app',
  appName: 'Biteful',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
