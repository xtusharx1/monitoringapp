import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

const loadFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem('dashboard-config');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error("Error loading config:", e);
    return null;
  }
};

const saveToLocalStorage = (value) => {
  try {
    localStorage.setItem('dashboard-config', JSON.stringify(value));
  } catch (e) {
    console.error("Error saving config:", e);
  }
};

const getDefaultPositions = () => [
  { x: 20, y: 20 },
  { x: 340, y: 20 },
  { x: 660, y: 20 },
  { x: 20, y: 290 },
  { x: 340, y: 290 },
  { x: 660, y: 290 },
];

const getDefaultSize = (type) => {
  switch (type) {
    case 'line_chart': return { width: 350, height: 250 };
    case 'gauge': return { width: 300, height: 250 };
    case 'key_metric': return { width: 250, height: 250 };
    default: return { width: 300, height: 250 };
  }
};

const getMetricTitle = (metric) => ({
  cpu_usage: 'CPU Usage',
  memory_usage: 'Memory Usage',
  latency: 'Request Latency',
  error_rate: 'Error Rate',
  request_count: 'Request Count',
  success_rate: 'Success Rate',
}[metric] || metric);

const getMetricUnit = (metric) => ({
  cpu_usage: '%',
  memory_usage: 'MB',
  latency: 'ms',
  error_rate: 'errors/sec',
  request_count: 'req/sec',
  success_rate: '%',
}[metric] || '');

const getMetricMax = (metric) => ({
  cpu_usage: 100,
  memory_usage: 65536,
  latency: 1000,
  error_rate: 20,
  request_count: 1000,
  success_rate: 100,
}[metric] || 100);

const getTypeSpecificProps = (type, metric) => {
  switch (type) {
    case 'line_chart':
      return { timeWindow: 5 };
    case 'gauge':
      const max = getMetricMax(metric);
      return {
        min: 0,
        max,
        thresholds: {
          warning: max * 0.75,
          critical: max * 0.9,
        }
      };
    case 'key_metric':
      return {
        unit: getMetricUnit(metric),
        showTrend: true,
      };
    default:
      return {};
  }
};

const getDefaultWidgets = () => {
  const positions = getDefaultPositions();
  return [
    {
      id: uuidv4(),
      type: 'line_chart',
      title: 'CPU Usage',
      metric: 'cpu_usage',
      refreshInterval: 2,
      timeWindow: 5,
      position: positions[0],
      size: getDefaultSize('line_chart')
    },
    {
      id: uuidv4(),
      type: 'gauge',
      title: 'Memory Usage',
      metric: 'memory_usage',
      refreshInterval: 2,
      min: 0,
      max: 65536,
      thresholds: {
        warning: 6144,
        critical: 7168,
      },
      position: positions[1],
      size: getDefaultSize('gauge')
    },
    {
      id: uuidv4(),
      type: 'key_metric',
      title: 'Error Rate',
      metric: 'error_rate',
      refreshInterval: 2,
      unit: 'errors/sec',
      showTrend: true,
      position: positions[2],
      size: getDefaultSize('key_metric')
    }
  ];
};

export const useDashboardStore = create((set, get) => {
  const saved = loadFromLocalStorage();

  return {
    widgets: saved?.widgets || getDefaultWidgets(),
    metrics: {},
    isDarkMode: saved?.isDarkMode || false,

    addWidget: (type, metric) => {
      const widgets = get().widgets;
      const defaultPositions = getDefaultPositions();
      const positionIndex = widgets.length % defaultPositions.length;
      const position = defaultPositions[positionIndex];

      const newWidget = {
        id: uuidv4(),
        type,
        metric,
        title: getMetricTitle(metric),
        refreshInterval: 2,
        position,
        size: getDefaultSize(type),
        ...getTypeSpecificProps(type, metric)
      };

      const updatedWidgets = [...widgets, newWidget];
      set({ widgets: updatedWidgets });
      saveToLocalStorage({ widgets: updatedWidgets, isDarkMode: get().isDarkMode });
    },

    removeWidget: (id) => {
      const widgets = get().widgets.filter(w => w.id !== id);
      set({ widgets });
      saveToLocalStorage({ widgets, isDarkMode: get().isDarkMode });
    },

    updateWidget: (updatedWidget) => {
      const widgets = get().widgets.map(w => w.id === updatedWidget.id ? updatedWidget : w);
      set({ widgets });
      saveToLocalStorage({ widgets, isDarkMode: get().isDarkMode });
    },

    updateWidgetPosition: (id, position) => {
      const widgets = get().widgets.map(w => w.id === id ? { ...w, position } : w);
      set({ widgets });
      saveToLocalStorage({ widgets, isDarkMode: get().isDarkMode });
    },

    updateWidgetSize: (id, size) => {
      const widgets = get().widgets.map(w => w.id === id ? { ...w, size } : w);
      set({ widgets });
      saveToLocalStorage({ widgets, isDarkMode: get().isDarkMode });
    },

    sendToFront: (id) => {
      const widgets = get().widgets;
      const maxZ = Math.max(...widgets.map(w => w.zIndex || 0));
      const updated = widgets.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w);
      set({ widgets: updated });
      saveToLocalStorage({ widgets: updated, isDarkMode: get().isDarkMode });
    },

    sendBackward: (id) => {
      const widgets = get().widgets;
      const minZ = Math.min(...widgets.map(w => w.zIndex ?? Infinity));
      const updated = widgets.map(w => w.id === id ? { ...w, zIndex: minZ - 1 } : w);
      set({ widgets: updated });
      saveToLocalStorage({ widgets: updated, isDarkMode: get().isDarkMode });
    },

    sendBackwardsStep: (id) => {
      const widgets = get().widgets;
      const widget = widgets.find(w => w.id === id);
      if (!widget) return;

      const currentZ = widget.zIndex || 0;
      const newZ = currentZ - 1;

      widgets.forEach(w => {
        if (w.zIndex === newZ) {
          w.zIndex = currentZ;
        }
      });

      widget.zIndex = newZ;
      set({ widgets: [...widgets] });
      saveToLocalStorage({ widgets, isDarkMode: get().isDarkMode });
    },

    addMetricDataPoint: (metric, value) => {
      const timestamp = Date.now();
      const dataPoint = { timestamp, value };

      set(state => {
        const oldData = state.metrics[metric] || [];
        const tenMinutesAgo = timestamp - 10 * 60 * 1000;
        const filtered = [...oldData, dataPoint].filter(p => p.timestamp > tenMinutesAgo).slice(-300);
        return {
          metrics: { ...state.metrics, [metric]: filtered }
        };
      });
    },

    toggleTheme: () => {
      const newDarkMode = !get().isDarkMode;
      set({ isDarkMode: newDarkMode });
      saveToLocalStorage({ widgets: get().widgets, isDarkMode: newDarkMode });
    }
  };
});
