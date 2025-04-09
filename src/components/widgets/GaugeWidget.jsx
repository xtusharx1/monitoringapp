import React, { useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { metricsSimulator } from '../../utils/dataSimulator';

const GaugeWidget = ({ widget, onSettingsClick, size }) => {
  const { metric, title, refreshInterval, min, max, thresholds } = widget;
  const { metrics, addMetricDataPoint, isDarkMode } = useDashboardStore();

  const metricData = metrics[metric] || [];
  const latestValue = metricData.length > 0 
    ? metricData[metricData.length - 1].value 
    : 0;

  const percentage = Math.min(100, Math.max(0, ((latestValue - min) / (max - min)) * 100));

  const getColor = () => {
    if (latestValue >= thresholds.critical) return '#ef4444';
    if (latestValue >= thresholds.warning) return '#f97316';
    return '#3b82f6';
  };

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

  const getGaugeHeight = () => {
    const height = size?.height || 250;
    return Math.max(20, height - 100) + 'px';
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
        <div className="gauge-container">
          <div className="gauge" style={{ height: getGaugeHeight() }}>
            <div 
              className="gauge-fill" 
              style={{ 
                width: `${percentage}%`, 
                backgroundColor: getColor() 
              }} 
            />
          </div>
          <div className="gauge-value">
            <span className="value">{latestValue.toFixed(1)}</span>
            <span className="unit">{getUnit()}</span>
          </div>
          <div className="gauge-limits">
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
        
        .gauge-container {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 100%;
          height: 100%;
        }
        
        .gauge {
          width: 100%;
          background-color: ${isDarkMode ? '#1e2734' : '#e5e7eb'};
          border-radius: 4px;
          overflow: hidden;
          position: relative;
          border: ${isDarkMode ? '1px solid #2d3a4f' : 'none'};
        }
        
        .gauge-fill {
          height: 100%;
          transition: width 0.5s ease;
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
        }
        
        .gauge-value {
          display: flex;
          align-items: baseline;
          justify-content: center;
          margin: 12px 0;
          font-weight: 700;
          color: ${getColor()};
        }
        
        .value {
          font-size: 24px;
          text-shadow: ${isDarkMode ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'};
        }
        
        .unit {
          font-size: 14px;
          margin-left: 4px;
          color: ${isDarkMode ? '#b4bfd0' : '#6b7280'};
        }
        
        .gauge-limits {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: ${isDarkMode ? '#b4bfd0' : '#6b7280'};
        }
      `}</style>
    </div>
  );
};

export default GaugeWidget;