import type { I18nMessages } from '../types';

const enUS: I18nMessages = {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    reset: 'Reset',
    empty: 'No data',
  },
  layout: {
    header: {
      settings: 'Interface Settings',
      language: 'Switch Language',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      collapse: 'Collapse Menu',
      expand: 'Expand Menu',
    },
    settings: {
      title: 'Interface Settings',
      themeMode: 'Theme',
      layoutMode: 'Menu Layout',
      themeColor: 'Primary Color',
      interface: 'Interface',
      tabs: 'Multi Tabs',
      breadcrumb: 'Breadcrumb',
      language: 'Language',
      reset: 'Reset to Default',
      customColor: 'Custom Color',
      colorTip: 'Applies immediately and is remembered.',
    },
    layoutMode: {
      vertical: 'Side Menu',
      horizontal: 'Top Menu',
      blend: 'Mixed Menu',
    },
    themeMode: {
      light: 'Light',
      dark: 'Dark',
    },
    tabs: {
      refresh: 'Refresh',
      close: 'Close Tab',
      closeOthers: 'Close Other Tabs',
      closeLeft: 'Close Tabs to the Left',
      closeRight: 'Close Tabs to the Right',
      closeAll: 'Close All Tabs',
      more: 'Tab Actions',
    },
    menu: {
      loading: 'Loading menu…',
      error: 'Failed to load menu',
      retry: 'Retry',
    },
    notFound: {
      title: 'Page Not Found',
      description: 'The page has been removed or the address is incorrect.',
      backHome: 'Back to Home',
    },
    missingComponent: {
      title: 'Page Component Missing',
      description: 'No page file under src/pages matches the menu component:',
    },
  },
};

export default enUS;
