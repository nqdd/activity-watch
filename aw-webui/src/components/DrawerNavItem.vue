<template lang="pug">
div.drawer-nav-item(:class="itemClasses")
  // Simple link (no children)
  router-link.nav-item-link(
    v-if="!hasChildren"
    :to="item.path"
    :class="{ active: isActive }"
    v-b-tooltip.right="collapsed && item.label ? item.label : ''"
  )
    icon.nav-icon(:name="item.icon")
    transition(name="fade")
      span.nav-label(v-if="!collapsed") {{ item.label }}

  // Expandable section (has children)
  div(v-else)
    div.nav-item-link.expandable(
      @click="toggleExpanded"
      :class="{ expanded: isExpanded }"
      v-b-tooltip.right="collapsed && item.label ? item.label : ''"
    )
      transition(name="fade")
        span.nav-label(v-if="!collapsed") {{ item.label }}
      transition(name="fade")
        icon.expand-icon(
          v-if="!collapsed"
          name="chevron-right"
          :class="{ rotated: isExpanded }"
        )

    // Children
    transition(name="expand")
      div.nav-children(v-if="isExpanded && !collapsed && item.children")
        drawer-nav-item(
          v-for="child in item.children"
          :key="child.id"
          :item="child"
          :collapsed="collapsed"
          :is-child="true"
          :level="level + 1"
        )

  // Divider
  hr.nav-divider(v-if="item.dividerAfter && !collapsed")
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import type { NavItem } from '~/stores/navigation';

// Import chevron icon
import 'vue-awesome/icons/chevron-right';

export default defineComponent({
  name: 'DrawerNavItem',
  props: {
    item: {
      type: Object as PropType<NavItem>,
      required: true,
    },
    collapsed: {
      type: Boolean,
      default: false,
    },
    isChild: {
      type: Boolean,
      default: false,
    },
    level: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      isExpanded: localStorage.getItem(`nav-expanded-${this.item.id}`) === 'true',
    };
  },
  computed: {
    hasChildren(): boolean {
      return !!(this.item.children && this.item.children.length > 0);
    },

    isActive(): boolean {
      if (!this.item.path) return false;
      // Special case for home path to avoid matching all routes
      if (this.item.path === '/') {
        return this.$route.path === '/' || this.$route.path === '/home';
      }
      return this.$route.path.startsWith(this.item.path);
    },

    hasActiveChild(): boolean {
      if (!this.item.children) return false;
      return this.item.children.some(
        child => child.path && this.$route.path.startsWith(child.path)
      );
    },

    itemClasses() {
      return {
        'is-child': this.isChild,
        'has-children': this.hasChildren,
        'is-expanded': this.isExpanded,
      };
    },
  },
  methods: {
    toggleExpanded() {
      if (!this.hasChildren) return;
      this.isExpanded = !this.isExpanded;
      localStorage.setItem(`nav-expanded-${this.item.id}`, String(this.isExpanded));
    },
  },
});
</script>

<style lang="scss" scoped>
.drawer-nav-item {
  margin-bottom: 2px;

  &.is-child {
    .nav-item-link {
      padding-left: 44px; // Indent children
    }
  }
}

.nav-item-link {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  text-decoration: none;
  color: rgba(0, 0, 0, 0.85);
  cursor: pointer;
  transition: background-color 0.2s ease, padding 0.2s ease;
  user-select: none;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &.active {
    background-color: rgba(10, 120, 255, 1);
    color: white;

    .nav-icon,
    .expand-icon {
      color: white;
    }
  }

  &.expandable {
    cursor: pointer;
  }
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: inherit;
}

.nav-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  font-size: 14px;
  font-weight: 400;
}

.expand-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.rotated {
    transform: rotate(90deg);
  }
}

.nav-children {
  margin-top: 2px;
}

.nav-divider {
  margin: 12px 0;
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
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

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

// Dark mode
body:has([href='/dark.css']) .nav-item-link {
  color: rgba(255, 255, 255, 0.85);

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }

  &.active {
    background-color: rgba(10, 120, 255, 1);
    color: white;
  }
}

body:has([href='/dark.css']) .nav-divider {
  border-top-color: rgba(255, 255, 255, 0.1);
}
</style>
