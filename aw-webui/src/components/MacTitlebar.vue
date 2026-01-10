<template lang="pug">
div.mac-titlebar(v-if="showTitlebar")
  div.titlebar-drag-region
  div.titlebar-content
    drawer-toggle
</template>

<script lang="ts">
import { mapState } from 'pinia';
import { usePlatformStore } from '~/stores/platform';

export default {
  name: 'MacTitlebar',
  computed: {
    ...mapState(usePlatformStore, ['isMac', 'isTauriContext']),

    showTitlebar() {
      // Only show on macOS in Tauri context
      return this.isMac && this.isTauriContext;
    },
  },
};
</script>

<style lang="scss" scoped>
.mac-titlebar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  z-index: 1002;
  -webkit-app-region: drag;
  pointer-events: none;

  .titlebar-content {
    -webkit-app-region: no-drag;
    padding-left: 80px; // Traffic lights spacing
    height: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    pointer-events: auto;
  }
}
</style>
