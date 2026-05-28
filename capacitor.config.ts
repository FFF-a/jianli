import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.liezhi.app',
  appName: '猎职',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
