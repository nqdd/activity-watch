<template lang="pug">
button.drawer-toggle(
  @click="toggleDrawer"
  :class="{ active: isOpen }"
  aria-label="Toggle sidebar"
  type="button"
)
  span.line
  span.line
  span.line
</template>

<script lang="ts">
import { mapState, mapActions } from 'pinia';
import { useDrawerStore } from '~/stores/drawer';

export default {
  name: 'DrawerToggle',
  computed: {
    ...mapState(useDrawerStore, ['isOpen']),
  },
  methods: {
    ...mapActions(useDrawerStore, { toggleDrawer: 'toggle' }),
  },
};
</script>

<style lang="scss" scoped>
.drawer-toggle {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: stretch;
  transition: background-color 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .line {
    width: 100%;
    height: 2px;
    background-color: #333;
    border-radius: 2px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  // Active state (X icon)
  &.active {
    .line:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }

    .line:nth-child(2) {
      opacity: 0;
    }

    .line:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }
  }
}

// Dark mode
body:has([href='/dark.css']) .drawer-toggle {
  .line {
    background-color: #e9ebf0;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
