import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';

const AddWidgetModal = ({ isOpen, onClose, isDarkMode }) => {
  const { addWidget } = useDashboardStore();
  
  const [widgetType, setWidgetType] = useState('line_chart');
  const [metric, setMetric] = useState('cpu_usage');
  const [refreshInterval, setRefreshInterval] = useState(2);
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    addWidget(widgetType, metric);
    onClose();
  };
  
  return (
    <div className="modal-overlay">
      <div className={`modal ${isDarkMode ? 'modal-dark' : 'modal-light'}`}>
        <div className="modal-header">
          <h2>Add New Widget</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="widget-type">Widget Type</label>
              <select 
                id="widget-type" 
                value={widgetType} 
                onChange={(e) => setWidgetType(e.target.value)}
              >
                <option value="line_chart">Line Chart</option>
                <option value="gauge">Gauge</option>
                <option value="key_metric">Key Metric</option>
              </select>
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
            
            <div className="modal-footer">
              <button 
                type="button" 
                className={`btn btn-secondary ${isDarkMode ? 'btn-dark' : 'btn-light'}`} 
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Plus size={16} /> Add Widget
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddWidgetModal;