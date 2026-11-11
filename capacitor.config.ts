import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Configuration Capacitor de Milo.
 *
 * Remarque importante sur l'orientation :
 * Capacitor 8 n'expose plus de clé `android.screenOrientation` dans son schéma
 * de configuration. L'orientation est donc verrouillée nativement dans
 * `android/app/src/main/AndroidManifest.xml`
 * (`android:screenOrientation="sensorLandscape"`), ce qui est la seule méthode
 * réellement appliquée par Android au démarrage de l'activité.
 */
const config: CapacitorConfig = {
  appId: 'com.milo.robot',
  appName: 'MILO Core',
  webDir: 'dist',
  loggingBehavior: 'debug',
  android: {
    // Évite le flash clair entre la fin du splash natif et le premier rendu React.
    backgroundColor: '#0B131E',
    allowMixedContent: false,
    captureInput: false,
    webContentsDebuggingEnabled: false,
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      // Le splash reste affiché 1,2 s puis disparaît en fondu.
      launchShowDuration: 1200,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      // Fond sombre identique à l'interface, aucun spinner.
      backgroundColor: '#0B131E',
      androidSplashResourceName: 'milo_splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      useDialog: false,
    },
    SystemBars: {
      // Barre de statut visible, icônes claires sur fond sombre.
      hidden: false,
      style: 'DARK',
      // Laisse le WebView gérer les encoches avec env(safe-area-inset-*).
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
    },
  },
}

export default config
