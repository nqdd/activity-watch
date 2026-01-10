<template lang="pug">
div#wrapper(v-if="loaded" :class="appClasses")
  // macOS titlebar (only on macOS Tauri)
  mac-titlebar

  // Drawer menu (replaces header)
  drawer

  // Traditional header (keep as fallback, but hidden)
  // aw-header(v-if="false")

  // Main content
  div.content-wrapper(
    :class="{'container': fullContainer === false, 'container-fluid': fullContainer !== false}"
    :style="contentStyle"
  ).px-0.px-md-2
    div.aw-container.my-sm-3.p-3
      error-boundary
        user-satisfaction-poll
        new-release-notification(v-if="isNewReleaseCheckEnabled")
        router-view

  aw-footer
</template>

<script lang="ts">
import { mapState } from 'pinia';
import { useSettingsStore } from '~/stores/settings';
import { useServerStore } from '~/stores/server';
import { usePlatformStore } from '~/stores/platform';
import { useDrawerStore } from '~/stores/drawer';
// if vite is used, you can import css file as module
//import darkCssUrl from '../static/dark.css?url';
//import darkCssContent from '../static/dark.css?inline';

export default {
  data: function () {
    return {
      activityViews: [],
      isNewReleaseCheckEnabled: !process.env.VUE_APP_ON_ANDROID,
      loaded: false,
    };
  },

  computed: {
    ...mapState(usePlatformStore, ['platform', 'titlebarHeight']),
    ...mapState(useDrawerStore, ['drawerWidth', 'isOpen']),

    fullContainer() {
      return this.$route.meta.fullContainer;
    },

    appClasses() {
      return {
        [`platform-${this.platform}`]: true,
        'drawer-open': this.isOpen,
      };
    },

    contentStyle() {
      const styles: any = {};

      // Add margin for drawer (desktop only)
      if (this.isOpen && typeof window !== 'undefined' && window.innerWidth >= 768) {
        styles.marginLeft = `${this.drawerWidth}px`;
      }

      // Add padding for macOS titlebar
      if (this.titlebarHeight > 0) {
        styles.paddingTop = `${this.titlebarHeight}px`;
      }

      styles.transition = 'margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
      styles.width = 'calc(100% - 250px)';

      return styles;
    },
  },

  async beforeCreate() {
    // Get Theme From LocalStorage
    const settingsStore = useSettingsStore();
    await settingsStore.ensureLoaded();
    const theme = settingsStore.theme;
    // Check Application Mode (Light | Dark)
    if (theme !== null && theme === 'dark') {
      const method: 'link' | 'style' = 'link';

      if (method === 'link') {
        // Method 1: Create <link> Element
        // Create Dark Theme Element
        const themeLink = document.createElement('link');
        themeLink.href = '/dark.css'; // darkCssUrl
        themeLink.rel = 'stylesheet';
        // Append Dark Theme Element If Selected Mode Is Dark
        theme === 'dark' ? document.querySelector('head').appendChild(themeLink) : '';
      } else {
        // Not supported for Webpack due to not supporting ?inline import in a cross-compatible way (afaik)
        // Method 2: Create <style> Element
        //const style = document.createElement('style');
        //style.innerHTML = darkCssContent;
        //theme === 'dark' ? document.querySelector('head').appendChild(style) : '';
      }
    }
    this.loaded = true;
  },

  mounted: async function () {
    // Initialize platform detection
    const platformStore = usePlatformStore();
    await platformStore.detectPlatform();

    // Initialize server info
    const serverStore = useServerStore();
    await serverStore.getInfo();
  },
};
</script>

<style lang="scss" scoped>
#wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding-top 0.2s ease;
}
</style>
