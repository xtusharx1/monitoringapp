import React, { useEffect } from 'react';
import { Settings, TrendingUp, TrendingDown } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { metricsSimulator } from '../../utils/dataSimulator';

const KeyMetricWidget = ({ widget, onSettingsClick, size }) => {
  const { metric, title, refreshInterval, unit, showTrend } = widget;
  const { metrics, addMetricDataPoint, isDarkMode } = useDashboardStore();

  const metricData = metrics[metric] || [];
  const latestValue = metricData.length > 0 
    ? metricData[metricData.length - 1].value 
    : 0;
  
  const previousValue = metricData.length > 1 
    ? metricData[metricData.length - 2].value 
    : latestValue;
  
  const trendValue = latestValue - previousValue;
  const trendPercentage = previousValue !== 0 
    ? (trendValue / previousValue) * 100 
    : 0;

  useEffect(() => {
    metricsSimulator.startSimulation(metric, refreshInterval, (value) => {
      addMetricDataPoint(metric, value);
    });

    return () => {
      metricsSimulator.stopSimulation(metric);
    };
  }, [metric, refreshInterval, addMetricDataPoint]);

  const getValueColor = () => {
    switch (metric) {
      case 'error_rate':
        return latestValue > 5 ? '#ef4444' : latestValue > 2 ? '#f97316' : '#22c55e';
      case 'latency':
        return latestValue > 500 ? '#ef4444' : latestValue > 200 ? '#f97316' : '#22c55e';
      case 'success_rate':
        return latestValue < 90 ? '#ef4444' : latestValue < 95 ? '#f97316' : '#22c55e';
      case 'cpu_usage':
        return latestValue > 80 ? '#ef4444' : latestValue > 60 ? '#f97316' : '#22c55e';
      case 'memory_usage':
        return latestValue > 7000 ? '#ef4444' : latestValue > 6000 ? '#f97316' : '#22c55e';
      case 'request_count':
        return '#3b82f6';
      default:
        return '#3b82f6';
    }
  };

  const getTrendColor = () => {
    const positiveMetrics = ['success_rate', 'request_count'];
    const isPositiveMetric = positiveMetrics.includes(metric);
    
    if (trendValue === 0) return '#9ca3af';
    if (isPositiveMetric) {
      return trendValue > 0 ? '#22c55e' : '#ef4444';
    } else {
      return trendValue < 0 ? '#22c55e' : '#ef4444';
    }
  };

  const getValueFontSize = () => {
    const width = size?.width || 300;
    if (width < 200) return '24px';
    if (width < 300) return '36px';
    return '48px';
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
        <div className="key-metric-container">
          <div className="key-metric-value" style={{ color: getValueColor(), fontSize: getValueFontSize() }}>
            {latestValue.toFixed(1)}
            <span className="key-metric-unit">{unit}</span>
          </div>
          
          {showTrend && (
            <div className="key-metric-trend" style={{ color: getTrendColor() }}>
              {trendValue > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="key-metric-trend-value">
                {Math.abs(trendPercentage).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        
        .key-metric-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          text-align: center;
        }
        
        .key-metric-value {
          display: flex;
          align-items: baseline;
          justify-content: center;
        }
        
        .key-metric-unit {
          font-size: 0.4em;
          margin-left: 4px;
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
        }
        
        .key-metric-trend {
          display: flex;
          align-items: center;
          margin-top: 8px;
          font-size: 14px;
        }
        
        .key-metric-trend-value {
          margin-left: 4px;
        }
      `}</style>
    </div>
  );
};

export default KeyMetricWidget;