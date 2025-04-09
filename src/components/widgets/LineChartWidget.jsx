import React, { useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Settings } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { metricsSimulator } from '../../utils/dataSimulator';

const LineChartWidget = ({ 
  widget, 
  onSettingsClick, 
  size = { height: 250 } 
}) => {
  const { 
    metric, 
    title, 
    refreshInterval, 
    timeWindow = 15, 
    min = 0,
    max = 100,
    thresholds = { warning: max * 0.8, critical: max * 0.9 }
  } = widget;

  const { metrics, addMetricDataPoint, isDarkMode } = useDashboardStore();

  const metricData = metrics[metric] || [];
  const timeWindowMs = timeWindow * 60 * 1000; 
  const currentTime = Date.now();
  const filteredData = metricData.filter(
    point => currentTime - point.timestamp < timeWindowMs
  );

  const chartData = filteredData
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(point => ({
      time: new Date(point.timestamp).toLocaleTimeString([], {
        hour: '2-digit', 
        minute: '2-digit'
      }),
      value: point.value,
    }));

  const latestValue = filteredData.length > 0 
    ? filteredData[filteredData.length - 1].value 
    : 0;

  useEffect(() => {
    metricsSimulator.startSimulation(metric, refreshInterval, (value) => {
      addMetricDataPoint(metric, value);
    });

    return () => {
      metricsSimulator.stopSimulation(metric);
    };
  }, [metric, refreshInterval, addMetricDataPoint]);

  const getUnit = () => {
    switch (metric) {
      case 'cpu_usage':
      case 'success_rate':
        return '%';
      case 'memory_usage':
        return 'MB';
      case 'latency':
        return 'ms';
      case 'error_rate':
        return 'errors/sec';
      case 'request_count':
        return 'req/sec';
      default:
        return '';
    }
  };

  const getColor = () => {
    if (latestValue >= thresholds.critical) return '#ef4444';  
    if (latestValue >= thresholds.warning) return '#f97316';
    return '#3b82f6'; 
  };

  const chartHeight = Math.max(100, (size.height || 250) - 100);

  return (
    <div className={`widget-inner ${isDarkMode ? 'widget-dark' : 'widget-light'}`}>
      <div className="widget-header">
        <h3 className="widget-title">{title}</h3>
        <button 
          type="button"
          className="widget-settings-btn" 
          onClick={(e) => {
            e.stopPropagation(); 
            onSettingsClick();
          }}
          title="Edit Widget Settings"
        >
          <Settings size={14} />
        </button>
      </div>
      <div className="widget-content">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDarkMode ? '#374151' : '#e5e7eb'}
              />
              <XAxis 
                dataKey="time" 
                tick={{ 
                  fontSize: 12, 
                  fill: isDarkMode ? '#9ca3af' : '#6b7280' 
                }}
                tickFormatter={(time) => time.split(':')[0] + ':' + time.split(':')[1]}
              />
              <YAxis 
                domain={[min, max]}
                tick={{ 
                  fontSize: 12, 
                  fill: isDarkMode ? '#9ca3af' : '#6b7280' 
                }}
              />
              <Tooltip 
                formatter={(value) => [
                  `${Number(value).toFixed(1)} ${getUnit()}`, 
                  'Value'
                ]}
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                  color: isDarkMode ? '#e5e7eb' : '#374151'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={getColor()} 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="chart-value">
            <span className="value" style={{ color: getColor() }}>
              {latestValue.toFixed(1)}
            </span>
            <span className="unit">{getUnit()}</span>
          </div>
          <div className="chart-limits">
            <span>{min}{getUnit()}</span>
            <span>{max}{getUnit()}</span>
          </div>
        </div>
      </div>
      <style jsx>{`
        .widget-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          overflow: hidden;
          padding: 12px;
          box-sizing: border-box;
          background-color: ${isDarkMode ? '#1f2937' : '#ffffff'};
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .widget-title {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: ${isDarkMode ? '#e5e7eb' : '#374151'};
        }
        
        .widget-settings-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .widget-settings-btn:hover {
          background-color: ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
        }
        
        .widget-content {
          flex: 1;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        
        .chart-container {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 100%;
          height: 100%;
        }
        
        .chart-value {
          display: flex;
          align-items: baseline;
          justify-content: center;
          margin: 12px 0;
          font-weight: 700;
        }
        
        .value {
          font-size: 24px;
        }
        
        .unit {
          font-size: 14px;
          margin-left: 4px;
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
        }
        
        .chart-limits {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
        }
      `}</style>
    </div>
  );
};

export default LineChartWidget;