import { io } from 'socket.io-client';

const connectionState = {
  status: 'initializing',
  error: null,
  lastErrorTime: null,
  reconnectAttempt: 0
};

let socket;
try {
  socket = io('http://localhost:4000', {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000
  });
  
  socket.on('connect', () => {
    console.log('Connected to metrics server');
    connectionState.status = 'connected';
    connectionState.error = null;
  });
  
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
    connectionState.status = 'error';
    connectionState.error = `Connection error: ${error.message}`;
    connectionState.lastErrorTime = new Date();
  });
  
  socket.on('disconnect', (reason) => {
    console.warn('Disconnected:', reason);
    connectionState.status = 'disconnected';
    connectionState.error = `Disconnected: ${reason}`;
    connectionState.lastErrorTime = new Date();
  });
  
  socket.on('reconnect_attempt', (attempt) => {
    console.log(`Reconnection attempt ${attempt}`);
    connectionState.status = 'connecting';
    connectionState.reconnectAttempt = attempt;
  });
} catch (error) {
  console.error('Failed to initialize socket:', error);
  connectionState.status = 'error';
  connectionState.error = `Failed to initialize socket: ${error.message}`;
  connectionState.lastErrorTime = new Date();
}

const liveData = {
  cpu_usage: null,
  memory_usage: null,
  latency: null,
  error_rate: null,
  request_count: null,
  success_rate: null,
  last_updated: null
};

if (socket) {
  socket.on('systemMetrics', (data) => {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format received');
      }
      
      Object.assign(liveData, data, { last_updated: new Date() });
      
      console.log('Updated metrics:', liveData);
    } catch (error) {
      console.error('Error processing metrics data:', error);
    }
  });
}

export class MetricsSimulator {
  constructor() {
    this.intervalIds = {};
    this.errorHandlers = {};
    this.simulationStatus = {};
  }

  startSimulation(metric, intervalSecs, callback, errorCallback) {
    
    if (!metric || !callback || typeof callback !== 'function') {
      console.error('Invalid simulation parameters');
      return;
    }
    if (errorCallback && typeof errorCallback === 'function') {
      this.errorHandlers[metric] = errorCallback;
    }
    
    this.stopSimulation(metric);
    
    this.simulationStatus[metric] = {
      active: true,
      startTime: new Date(),
      lastError: null
    };
    
    try {
      const id = setInterval(() => {
        try {
          if (connectionState.status !== 'connected') {
            const error = new Error(connectionState.error || 'Not connected to server');
            this.handleSimulationError(metric, error);
            return;
          }
          
          const value = liveData[metric];
          
          if (value !== undefined && value !== null) {
            callback(value, {
              timestamp: liveData.last_updated,
              connectionStatus: connectionState.status
            });
          } else {
            const error = new Error(`No data available for metric: ${metric}`);
            this.handleSimulationError(metric, error);
          }
        } catch (error) {
          this.handleSimulationError(metric, error);
        }
      }, intervalSecs * 1000);
      
      this.intervalIds[metric] = id;
    } catch (error) {
      console.error(`Failed to start simulation for ${metric}:`, error);
      this.handleSimulationError(metric, error);
    }
  }

  stopSimulation(metric) {
    if (this.intervalIds[metric]) {
      clearInterval(this.intervalIds[metric]);
      delete this.intervalIds[metric];
      
      if (this.simulationStatus[metric]) {
        this.simulationStatus[metric].active = false;
        this.simulationStatus[metric].endTime = new Date();
      }
    }
  }

  stopAllSimulations() {
    Object.keys(this.intervalIds).forEach(metric => {
      clearInterval(this.intervalIds[metric]);
    });
    this.intervalIds = {};
  }
  
  handleSimulationError(metric, error) {
    if (this.simulationStatus[metric]) {
      this.simulationStatus[metric].lastError = error.message;
      this.simulationStatus[metric].lastErrorTime = new Date();
    }
    
    console.error(`Error in ${metric} simulation:`, error.message);
    
    if (this.errorHandlers[metric]) {
      try {
        this.errorHandlers[metric](error);
      } catch (handlerError) {
        console.error(`Error in error handler for ${metric}:`, handlerError);
      }
    }
  }
  
  getConnectionStatus() {
    return {
      ...connectionState
    };
  }
  
  reconnect() {
    if (socket && typeof socket.connect === 'function') {
      connectionState.status = 'connecting';
      socket.connect();
    }
  }
}

export const metricsSimulator = new MetricsSimulator();