
const DASHBOARD_CONFIG_KEY = 'apm-dashboard-config';


export function loadDashboardConfig() {
  try {
    const savedConfig = localStorage.getItem(DASHBOARD_CONFIG_KEY);
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    return null;
  } catch (error) {
    console.error('Failed to load dashboard configuration from localStorage:', error);
    return null;
  }
}


export function saveDashboardConfig(config) {
  try {
    localStorage.setItem(DASHBOARD_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save dashboard configuration to localStorage:', error);
  }
}