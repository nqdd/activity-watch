<template lang="pug">
div.drawer-container
  // Backdrop (for mobile overlay mode)
  transition(name="fade")
    div.drawer-backdrop(
      v-if="showBackdrop"
      @click="closeDrawer"
    )

  // Main drawer
  div.drawer(
    :class="drawerClasses"
    :style="drawerStyle"
  )
    // Header
    div.drawer-header
      router-link.drawer-logo(to="/")
        img(src="/logo.png" alt="ActivityWatch")
        span.logo-text ActivityWatch

    // Navigation
    div.drawer-nav(ref="navArea")
      drawer-nav-item(
        v-for="item in navigationItems"
        :key="item.id"
        :item="item"
        :collapsed="false"
      )

    // Footer
    div.drawer-footer(v-if="info")
      small.version v{{ info.version }}
      small.hostname {{ info.hostname }}
</template>

<script lang="ts">
import { mapState, mapActions } from 'pinia';
import { useDrawerStore } from '~/stores/drawer';
import { usePlatformStore } from '~/stores/platform';
import { useNavigationStore } from '~/stores/navigation';
import { useServerStore } from '~/stores/server';

// Import icons used in drawer
import 'vue-awesome/icons/home';

export default {
  name: 'Drawer',
  data() {
    return {
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    };
  },
  computed: {
    ...mapState(useDrawerStore, ['isOpen', 'drawerWidth']),
    ...mapState(usePlatformStore, ['platform', 'isMac', 'titlebarHeight']),
    ...mapState(useNavigationStore, ['allItems']),
    ...mapState(useServerStore, ['info']),

    navigationItems() {
      return this.allItems;
    },

    drawerClasses() {
      return {
        'drawer-open': this.isOpen,
        [`platform-${this.platform}`]: true,
      };
    },

    drawerStyle() {
      return {
        width: `${this.drawerWidth}px`,
        paddingTop: `${this.titlebarHeight}px`,
      };
    },

    showBackdrop() {
      // Show backdrop on mobile when drawer is open
      return this.isOpen && this.windowWidth < 768;
    },

    isMobile() {
      return this.windowWidth < 768;
    },
  },
  async mounted() {
    // Load activity views
    const navigationStore = useNavigationStore();
    await navigationStore.loadActivityViews();

    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeydown);

    // Window resize
    window.addEventListener('resize', this.handleResize);
    this.handleResize(); // Initial check
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    ...mapActions(useDrawerStore, ['toggle', 'setOpen']),

    handleKeydown(e: KeyboardEvent) {
      // Cmd+Shift+D (Mac) or Ctrl+Shift+D (Win/Linux)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        this.toggle();
      }
    },

    handleResize() {
      this.windowWidth = window.innerWidth;

      // Auto-close on mobile when resizing down
      if (this.windowWidth < 768 && this.isOpen) {
        // Optional: auto-close on mobile
        // this.setOpen(false);
      }
    },

    closeDrawer() {
      if (this.isMobile) {
        this.setOpen(false);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../style/globals';

.drawer-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  pointer-events: none;

  * {
    pointer-events: auto;
  }
}

.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

.drawer {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 250px;
  background-color: rgba(247, 250, 252, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  transform: translateX(-100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  -webkit-user-select: none;
  user-select: none;

  &.drawer-open {
    transform: translateX(0);
  }
}

.drawer-header {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;

  .drawer-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: inherit;
    min-width: 0;

    img {
      width: 28px;
      height: 28px;
      flex-shrink: 0;
    }

    .logo-text {
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      color: rgba(0, 0, 0, 0.85);
    }
  }
}

.drawer-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;

  // macOS-style scrollbar
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

.drawer-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;

  small {
    font-size: 11px;
    color: rgba(0, 0, 0, 0.55);
    text-align: center;
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Dark mode
body:has([href='/dark.css']) .drawer {
  background-color: rgba(28, 28, 30, 0.8);
  border-right-color: rgba(255, 255, 255, 0.1);

  .drawer-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);

    .drawer-logo .logo-text {
      color: rgba(255, 255, 255, 0.85);
    }
  }

  .drawer-nav {
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .drawer-footer {
    border-top-color: rgba(255, 255, 255, 0.1);

    small {
      color: rgba(255, 255, 255, 0.55);
    }
  }
}
</style>
