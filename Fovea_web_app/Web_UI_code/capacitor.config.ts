import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.fovea.app',
  appName: 'Fovea',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
