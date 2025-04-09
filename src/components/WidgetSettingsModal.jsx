import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';

const WidgetSettingsModal = ({ widgetId, isOpen, onClose, isDarkMode }) => {
  const { widgets, updateWidget } = useDashboardStore();
  
  const widget = widgets.find(w => w.id === widgetId);
  
  const [title, setTitle] = useState('');
  const [metric, setMetric] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(2);
  
  const [timeWindow, setTimeWindow] = useState(5);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [warningThreshold, setWarningThreshold] = useState(75);
  const [criticalThreshold, setCriticalThreshold] = useState(90);
  const [showTrend, setShowTrend] = useState(true);
  
  useEffect(() => {
    if (widget) {
      setTitle(widget.title || '');
      setMetric(widget.metric || '');
      setRefreshInterval(widget.refreshInterval || 2);
      
      if (widget.type === 'line_chart' && widget.timeWindow) {
        setTimeWindow(widget.timeWindow);
      }
      
      if (widget.type === 'gauge') {
        setMin(widget.min || 0);
        setMax(widget.max || 100);
        setWarningThreshold(widget.thresholds?.warning || 75);
        setCriticalThreshold(widget.thresholds?.critical || 90);
      }
      
      if (widget.type === 'key_metric') {
        setShowTrend(widget.showTrend !== false);
      }
    }
  }, [widget, isOpen]);
  
  if (!isOpen || !widget) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    let updatedWidget = {
      ...widget,
      title,
      metric,
      refreshInterval
    };
    
    if (widget.type === 'line_chart') {
      updatedWidget.timeWindow = timeWindow;
    } else if (widget.type === 'gauge') {
      updatedWidget.min = min;
      updatedWidget.max = max;
      updatedWidget.thresholds = {
        warning: warningThreshold,
        critical: criticalThreshold
      };
    } else if (widget.type === 'key_metric') {
      updatedWidget.showTrend = showTrend;
      updatedWidget.unit = getMetricUnit(metric);
    }
    
    updateWidget(updatedWidget);
    onClose();
  };
  
  const getMetricUnit = (metricType) => {
    switch (metricType) {
      case 'cpu_usage': return '%';
      case 'memory_usage': return 'MB';
      case 'latency': return 'ms';
      case 'error_rate': return 'errors/sec';
      case 'request_count': return 'req/sec';
      case 'success_rate': return '%';
      default: return '';
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal ${isDarkMode ? 'modal-dark' : 'modal-light'}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Widget Settings</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="widget-title">Title</label>
              <input 
                id="widget-title"
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="metric">Metric</label>
              <select 
                id="metric" 
                value={metric} 
                onChange={(e) => setMetric(e.target.value)}
              >
                <option value="cpu_usage">CPU Usage (%)</option>
                <option value="memory_usage">Memory Usage (MB)</option>
                <option value="latency">Latency (ms)</option>
                <option value="error_rate">Error Rate (errors/sec)</option>
                <option value="request_count">Request Count (req/sec)</option>
                <option value="success_rate">Success Rate (%)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="refresh-interval">Refresh Interval (seconds)</label>
              <input 
                id="refresh-interval"
                type="number" 
                min="1"
                max="60"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              />
            </div>
            
            {/* Type-specific settings */}
            {widget.type === 'line_chart' && (
              <div className="form-group">
                <label htmlFor="time-window">Time Window (minutes)</label>
                <input 
                  id="time-window"
                  type="number" 
                  min="1"
                  max="60"
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(parseInt(e.target.value))}
                />
              </div>
            )}
            
            {widget.type === 'gauge' && (
              <>
                <div className="form-group">
                  <label htmlFor="min-value">Minimum Value</label>
                  <input 
                    id="min-value"
                    type="number" 
                    value={min}
                    onChange={(e) => setMin(parseInt(e.target.value))}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="max-value">Maximum Value</label>
                  <input 
                    id="max-value"
                    type="number" 
                    value={max}
                    onChange={(e) => setMax(parseInt(e.target.value))}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="warning-threshold">Warning Threshold</label>
                  <input 
                    id="warning-threshold"
                    type="number" 
                    min={min}
                    max={max}
                    value={warningThreshold}
                    onChange={(e) => setWarningThreshold(parseInt(e.target.value))}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="critical-threshold">Critical Threshold</label>
                  <input 
                    id="critical-threshold"
                    type="number" 
                    min={min}
                    max={max}
                    value={criticalThreshold}
                    onChange={(e) => setCriticalThreshold(parseInt(e.target.value))}
                  />
                </div>
              </>
            )}
            
            {widget.type === 'key_metric' && (
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={showTrend}
                    onChange={(e) => setShowTrend(e.target.checked)}
                  />
                  Show Trend Indicator
                </label>
              </div>
            )}
            
            <div className="modal-footer">
              <button 
                type="button" 
                className={`btn btn-secondary ${isDarkMode ? 'btn-dark' : 'btn-light'}`} 
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WidgetSettingsModal;