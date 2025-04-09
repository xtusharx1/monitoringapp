**Real-Time Application Monitoring Dashboard**

A configurable, real-time dashboard for monitoring system and application performance metrics using WebSockets and React.

**🚀 Features**

- **Customizable Dashboard Layout**
  Drag, drop, and resize widgets using react-grid-layout.
- **Widget Types**
  - **Line Chart**: Visualizes time-series data
  - **Gauge**: Displays current values against thresholds
  - **Key Metric**: Shows a single important value with trends
- **Real-Time Metrics via WebSocket**
  Backend server streams **live CPU and memory stats** from the host machine using native OS modules.
- **Dashboard Configuration**
  Add/remove widgets, choose metric types, and set refresh intervals.
- **Persistent Layout**
  Dashboard state is saved in localStorage.
- **Dark/Light Mode**
  Toggle between dark and light themes.
-----
**🧠 Tech Stack**

**Frontend:**

- React.js
- Zustand (state management)
- react-grid-layout (drag & resize)
- Recharts (charts)
- Lucide React (icons)
- WebSocket client

**Backend:**

- Node.js
- Express
- ws (WebSocket library)
- os (to gather system stats)
-----


**⚙️ Setup and Installation**

**1. Clone the Repository**

git clone https://github.com/yourusername/apm-dashboard.git

cd apm-dashboard

-----
**2. Install Frontend Dependencies**

npm install

-----

**3. Start the Frontend**

npm start

App will run on:

👉 http://localhost:3000

-----
**4. Start the Backend Server**

cd Backend

npm install

node server.js

WebSocket will start at:

👉 ws://localhost:4000

Make sure ports 3000 (frontend) and 4000 (backend) are available on your machine.

-----
**🧪 Usage**

**Adding Widgets**

1. Click "Add Widget" in the top-right corner
1. Choose a widget type (Line Chart, Gauge, or Key Metric)
1. Select a metric (CPU, Memory, etc.)
1. Set refresh interval
1. Click **Add**

**Customize the Dashboard**

- **Move Widgets**: Drag and move anywhere but you cant stack the widget
- **Resize Widgets**: Use the edge or corners
- **Remove Widgets**: Right click and close the widget
-----
**🌙 Theme Toggle**

Click the sun/moon icon in the top-right corner to switch between light and dark themes.

-----
