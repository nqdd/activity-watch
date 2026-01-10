import { defineStore } from 'pinia';

export const useDrawerStore = defineStore('drawer', {
  state: () => ({
    isOpen: localStorage.getItem('drawerOpen') !== 'false', // default: true
  }),

  getters: {
    drawerWidth: (state): number => {
      if (!state.isOpen) return 0;
      return 250; // Always 250px when open
    },
  },

  actions: {
    toggle() {
      this.isOpen = !this.isOpen;
      localStorage.setItem('drawerOpen', String(this.isOpen));
    },

    setOpen(value: boolean) {
      this.isOpen = value;
      localStorage.setItem('drawerOpen', String(this.isOpen));
    },
  },
});
