import { defineStore } from 'pinia';

export const usePlatformStore = defineStore('platform', {
  state: () => ({
    platform: (localStorage.getItem('platform') || 'unknown') as
      | 'macos'
      | 'windows'
      | 'linux'
      | 'unknown',
    isLoaded: false,
    isTauriContext: false,
  }),

  getters: {
    isMac: state => state.platform === 'macos',
    isWindows: state => state.platform === 'windows',
    isLinux: state => state.platform === 'linux',
    isBrowser: state => state.platform === 'unknown',

    // macOS titlebar height
    titlebarHeight: state => (state.platform === 'macos' ? 30 : 0),
  },

  actions: {
    async detectPlatform() {
      // Check if running in Tauri
      if (typeof window !== 'undefined' && window.__TAURI__) {
        this.isTauriContext = true;
        try {
          const { invoke } = window.__TAURI__.tauri;
          this.platform = await invoke('get_platform');
          localStorage.setItem('platform', this.platform);
        } catch (error) {
          console.error('Failed to detect platform via Tauri:', error);
          this.platform = this.detectFromUserAgent();
        }
      } else {
        // Browser fallback
        this.platform = this.detectFromUserAgent();
      }
      this.isLoaded = true;
    },

    detectFromUserAgent(): 'macos' | 'windows' | 'linux' | 'unknown' {
      if (typeof window === 'undefined') return 'unknown';

      const userAgent = window.navigator.userAgent.toLowerCase();

      if (userAgent.includes('mac')) return 'macos';
      if (userAgent.includes('win')) return 'windows';
      if (userAgent.includes('linux')) return 'linux';

      return 'unknown';
    },
  },
});
