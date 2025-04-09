import React, { useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { metricsSimulator } from '../../utils/dataSimulator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const LineChartWidget = ({ widget, onSettingsClick, size }) => {
  const { metric, title, refreshInterval, color, showGrid } = widget;
  const { metrics, addMetricDataPoint, isDarkMode } = useDashboardStore();

  const metricData = metrics[metric] || [];
  
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

  const getLatestValue = () => {
    if (metricData.length === 0) return 0;
    return metricData[metricData.length - 1].value;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="widget-inner">
      <div className="widget-header">
        <h3 className="widget-title">{title}</h3>
        <button 
          type="button"
          className="widget-settings-btn" 
          onClick={(e) => {
            e.stopPropagation();
            onSettingsClick();
          }}
        >
          <Settings size={14} />
        </button>
      </div>
      <div className="widget-content">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metricData}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 
              />
            )}
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: 10 }}
              tickFormatter={formatTimestamp}
              stroke={isDarkMode ? '#94a3b8' : '#6b7280'}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              stroke={isDarkMode ? '#94a3b8' : '#6b7280'}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#253145' : '#ffffff',
                borderColor: isDarkMode ? '#2d3a4f' : '#e5e7eb',
                color: isDarkMode ? '#e2e8f0' : '#374151'
              }}
              labelFormatter={formatTimestamp}
              formatter={(value) => [`${value.toFixed(1)}${getUnit()}`, metric]}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color || '#3b82f6'} 
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="widget-footer">
        <div className="metric-value">
          <span className="value">{getLatestValue().toFixed(1)}</span>
          <span className="unit">{getUnit()}</span>
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
          background-color: ${isDarkMode ? '#253145' : '#ffffff'};
          border-radius: 8px;
          box-shadow: ${isDarkMode ? '0 4px 10px rgba(0, 0, 0, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.1)'};
          border: ${isDarkMode ? '1px solid #2d3a4f' : 'none'};
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
          color: ${isDarkMode ? '#e2e8f0' : '#374151'};
        }
        
        .widget-settings-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: ${isDarkMode ? '#94a3b8' : '#6b7280'};
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
        
        .widget-footer {
          display: flex;
          justify-content: center;
          margin-top: 12px;
        }
        
        .metric-value {
          display: flex;
          align-items: baseline;
        }
        
        .value {
          font-size: 20px;
          font-weight: 700;
          color: ${isDarkMode ? '#e2e8f0' : '#374151'};
        }
        
        .unit {
          font-size: 12px;
          margin-left: 4px;
          color: ${isDarkMode ? '#94a3b8' : '#6b7280'};
        }
      `}</style>
    </div>
  );
};

export default LineChartWidget;