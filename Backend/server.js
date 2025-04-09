import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import si from 'systeminformation';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());

io.on('connection', async (socket) => {
  const mem = await si.mem();
  const totalMemoryMB = Math.round(mem.total / (1024 * 1024));
  socket.emit('system_info', { totalMemoryMB });
  
});

setInterval(async () => {
  const cpu = await si.currentLoad();
  const mem = await si.mem();
  const net = await si.networkStats();

  io.emit('systemMetrics', {
    cpu_usage: +cpu.currentLoad.toFixed(1),
    memory_usage: +(mem.used / (1024 * 1024)).toFixed(1), 
    latency: +(net[0]?.tx_sec || 0), 
    error_rate: Math.floor(Math.random() * 3), 
    request_count: Math.floor(Math.random() * 500), 
    success_rate: 100 
  });
}, 1000);

server.listen(4000, () => {
  console.log('✅ System metrics server running on http://localhost:4000');
});
