import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); 
const liveData = {
  cpu_usage: null,
  memory_usage: null,
  latency: null,
  error_rate: null,
  request_count: null,
  success_rate: null,
};

socket.on('systemMetrics', (data) => {
  Object.assign(liveData, data);
});

export class MetricsSimulator {
  constructor() {
    this.intervalIds = {};
  }

  startSimulation(metric, intervalSecs, callback) {
    this.stopSimulation(metric);
    const id = setInterval(() => {
      const value = liveData[metric];
      if (value !== undefined && value !== null) {
        callback(value);
      }
    }, intervalSecs * 1000);
    this.intervalIds[metric] = id;
  }

  stopSimulation(metric) {
    if (this.intervalIds[metric]) {
      clearInterval(this.intervalIds[metric]);
      delete this.intervalIds[metric];
    }
  }

  stopAllSimulations() {
    Object.keys(this.intervalIds).forEach(metric => {
      clearInterval(this.intervalIds[metric]);
    });
    this.intervalIds = {};
  }
}

export const metricsSimulator = new MetricsSimulator();
