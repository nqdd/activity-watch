import { defineStore } from 'pinia';
import { useBucketsStore } from '~/stores/buckets';
import { useSettingsStore } from '~/stores/settings';
import { IBucket } from '~/util/interfaces';
import _ from 'lodash';

export interface NavItem {
  id: string;
  path?: string;
  label: string;
  icon: string;
  children?: NavItem[];
  devOnly?: boolean;
  dividerAfter?: boolean;
  isExpandable?: boolean;
}

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    activityViews: [] as NavItem[],
    isActivityViewsLoaded: false,
  }),

  getters: {
    // Base navigation structure
    baseItems(): NavItem[] {
      return [
        {
          id: 'home',
          path: '/',
          label: 'Home',
          icon: 'home',
        },
        {
          id: 'activity',
          label: 'Activity',
          icon: 'calendar-day',
          isExpandable: true,
          children: this.activityViews, // Dynamically populated
          dividerAfter: false,
        },
        {
          id: 'timeline',
          path: '/timeline',
          label: 'Timeline',
          icon: 'stream',
        },
        {
          id: 'stopwatch',
          path: '/stopwatch',
          label: 'Stopwatch',
          icon: 'stopwatch',
          dividerAfter: true, // Divider after this item
        },
        {
          id: 'tools',
          label: 'Tools',
          icon: 'tools',
          isExpandable: true,
          children: [
            {
              id: 'search',
              path: '/search',
              label: 'Search',
              icon: 'code',
            },
            {
              id: 'query',
              path: '/query',
              label: 'Query',
              icon: 'code',
            },
            {
              id: 'trends',
              path: '/trends',
              label: 'Trends',
              icon: 'chart-line',
              devOnly: true,
            },
            {
              id: 'report',
              path: '/report',
              label: 'Report',
              icon: 'chart-pie',
              devOnly: true,
            },
            {
              id: 'alerts',
              path: '/alerts',
              label: 'Alerts',
              icon: 'flag-checkered',
              devOnly: true,
            },
            {
              id: 'timespiral',
              path: '/timespiral',
              label: 'Timespiral',
              icon: 'history',
              devOnly: true,
            },
            {
              id: 'graph',
              path: '/graph',
              label: 'Graph',
              icon: 'project-diagram',
              devOnly: true,
            },
          ],
        },
        {
          id: 'buckets',
          path: '/buckets',
          label: 'Raw Data',
          icon: 'database',
          dividerAfter: true, // Divider after this item
        },
        {
          id: 'settings',
          path: '/settings',
          label: 'Settings',
          icon: 'cog',
        },
      ];
    },

    // All navigation items (filtered by devmode)
    allItems(): NavItem[] {
      const settingsStore = useSettingsStore();
      const devmode = settingsStore.devmode;

      // Filter out devOnly items if devmode is false
      const filterItems = (items: NavItem[]): NavItem[] => {
        return items
          .filter(item => !item.devOnly || devmode)
          .map(item => ({
            ...item,
            children: item.children ? filterItems(item.children) : undefined,
          }));
      };

      return filterItems(this.baseItems);
    },
  },

  actions: {
    async loadActivityViews() {
      // Same logic as Header.vue (lines 142-181)
      const bucketStore = useBucketsStore();
      await bucketStore.ensureLoaded();
      const buckets: IBucket[] = bucketStore.buckets;
      const types_by_host: Record<string, any> = {};

      const activityViews: NavItem[] = [];

      // Detect bucket types per host
      _.each(buckets, v => {
        types_by_host[v.hostname] = types_by_host[v.hostname] || {};
        types_by_host[v.hostname].afk ||= v.type == 'afkstatus';
        types_by_host[v.hostname].window ||= v.type == 'currentwindow';
        types_by_host[v.hostname].android ||= v.type == 'currentwindow' && v.id.includes('android');
      });

      // Build activity view items
      _.each(types_by_host, (types, hostname) => {
        if (hostname != 'unknown') {
          activityViews.push({
            id: `activity-${hostname}`,
            path: `/activity/${hostname}`,
            label: hostname,
            icon: 'desktop',
          });
        }
        if (types['android']) {
          activityViews.push({
            id: `activity-${hostname}-android`,
            path: `/activity/${hostname}`,
            label: `${hostname} (Android)`,
            icon: 'mobile',
          });
        }
      });

      this.activityViews = activityViews;
      this.isActivityViewsLoaded = true;
    },
  },
});
