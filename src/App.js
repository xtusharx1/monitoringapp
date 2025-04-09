import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { metricsSimulator } from './utils/dataSimulator';
import { RefreshCw, ServerOff, Activity } from 'lucide-react';
import { useDashboardStore } from './store/dashboardStore';
import './App.css';

function App() {
  const [connectionState, setConnectionState] = useState('initializing');
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const { isDarkMode } = useDashboardStore();

  const toastStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    transition: 'transform 0.5s ease, opacity 0.5s ease',
    borderRadius: '20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  };

  const visibleStyle = {
    transform: 'translateY(0)',
    opacity: 1,
  };

  const hiddenStyle = {
    transform: 'translateY(100px)',
    opacity: 0,
  };

  const indicatorStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(52, 211, 153, 0.1)',
    borderRadius: '20px',
    fontSize: '14px',
    color: isDarkMode ? '#34d399' : '#10b981',
    border: isDarkMode ? '1px solid rgba(52, 211, 153, 0.3)' : 'none',
  };

  useEffect(() => {
    const checkConnectionStatus = () => {
      const status = metricsSimulator.getConnectionStatus();
      setConnectionState(status.status || 'disconnected');
      
      if (!isInitialized) {
        setIsInitialized(true);
      }
    };

    checkConnectionStatus();
    const intervalId = setInterval(checkConnectionStatus, 2000);
    
    return () => clearInterval(intervalId);
  }, [isInitialized, retryCount]);

  useEffect(() => {
    let headerTimer;
    
    if (connectionState === 'connected') {
      setShowHeader(true);
      headerTimer = setTimeout(() => {
        setShowHeader(false);
      }, 5000);
    }
    
    return () => {
      if (headerTimer) clearTimeout(headerTimer);
    };
  }, [connectionState]);

  const handleReconnect = () => {
    setConnectionState('connecting');
    setRetryCount(prev => prev + 1);
    metricsSimulator.reconnect();
  };

  const renderLoadingScreen = () => (
    <div className="loading-screen">
      <div className="loading-icon">
        <RefreshCw size={48} className="spinning-icon" />
      </div>
      <h2>Initializing Dashboard</h2>
      <p>Connecting to metrics server...</p>
    </div>
  );

  const renderConnectingScreen = () => (
    <div className="connecting-screen">
      <div className="connecting-icon">
        <RefreshCw size={48} className="spinning-icon" />
      </div>
      <h2>Reconnecting</h2>
      <p>Attempting to establish connection...</p>
      <div className="progress-bar">
        <div className="progress-fill"></div>
      </div>
    </div>
  );

  const renderErrorScreen = () => (
    <div className="error-screen">
      <div className="error-content">
        <div className="error-icon">
          <ServerOff size={64} />
        </div>
        
        <h1>Connection Error</h1>
        
        <div className="button-container">
          <button className="reconnect-button" onClick={handleReconnect}>
            <RefreshCw size={16} />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!isInitialized || connectionState === 'initializing') {
      return renderLoadingScreen();
    }
    
    if (connectionState === 'disconnected' || connectionState === 'error') {
      return renderErrorScreen();
    }
    
    if (connectionState === 'connecting') {
      return renderConnectingScreen();
    }
    
    return <Dashboard />;
  };

  return (
    <div className={`app-container app-state-${connectionState} ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {connectionState === 'connected' && (
        <div style={{...toastStyle, ...(showHeader ? visibleStyle : hiddenStyle)}}>
          <div style={indicatorStyle}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981'
            }}></div>
            <Activity size={16} />
            <span>Connected to metrics server</span>
          </div>
        </div>
      )}
      
      <main className="app-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;