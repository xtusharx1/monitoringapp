**Real-Time Application Monitoring Dashboard**

A configurable, real-time dashboard for monitoring system and application performance metrics using WebSockets and React.

## 🚀 Features

- **Customizable Dashboard Layout**  
  Drag, drop, and resize widgets using `react-grid-layout` with automatic **overlap prevention** for a clean UI.

- **Widget Types**
  - 📈 **Line Chart** – Visualizes time-series data like CPU or memory usage.
  - 🧭 **Gauge** – Displays current values with color-coded thresholds:
    - 🔵 **Normal**: Below warning threshold  
    - 🟠 **Warning**: Between warning and critical  
    - 🔴 **Critical**: Above critical threshold  
  - 🔢 **Key Metric** – Shows a single KPI with optional trends.

- **Real-Time Metrics via WebSocket**  
  Backend streams **live system stats** (CPU %, memory usage) using native OS modules and WebSocket.

- **Widget Configuration**
  - Add/remove widgets with a customizable dropdown.
  - Choose metric type, set refresh interval, and update widget titles.
  - Configure thresholds for gauge widgets (min, max, warning, critical).
  - Dropdown-based metric selector allows users to build their own widget setup.

- **Persistent Layout & State (💾 localStorage)**  
  The dashboard layout, widget settings, and theme are saved across sessions.

- **Dark/Light Mode (🌓)**  
  Toggle between light and dark themes using the switch in the header.

- **Responsive UI (📱)**  
  Fully responsive and usable on desktop, tablet, and mobile devices.

- **WebSocket Connection Handling (🔌)**  
  Displays a user-friendly connection error screen if WebSocket connection fails.

-----
## 🧠 Tech Stack

### 🔧 Frontend:
- **React.js** – UI development
- **Zustand** – Lightweight state management to store widget configs and layout
- **react-grid-layout** – Handles drag-and-resize for widgets
- **Recharts** – For visualizing metric data (Line charts, Gauges, etc.)
- **Lucide React** – For icons
- **WebSocket Client** – For receiving real-time data updates

### 🖥️ Backend:
- **Node.js + Express** – Basic backend server setup
- **ws** – WebSocket server to push real-time metric data
- **os (built-in Node module)** – Used to simulate system stats like CPU and memory usage

-----
## 🧱 Architecture

The app follows a simple yet scalable architecture:

1. **Component-Based Frontend**  
   All UI elements like widgets, modals, and buttons are built as reusable React components inside the `components/` folder.

2. **Centralized State Management**  
   I used Zustand to keep track of the dashboard state — this includes layout, widget configurations, and refresh intervals. It’s lightweight and easier to use than Redux for this size of app.

3. **Real-Time Data Layer**  
   The frontend connects to a WebSocket server running on Node.js. It sends back simulated metric data at regular intervals. If the connection drops, an error screen is shown with clean UI feedback.

4. **Persistence with localStorage**  
   The dashboard layout, selected metrics, and widget settings are saved using localStorage. So even if the user refreshes the page, their dashboard remains intact.

5. **Responsive Grid Layout**  
   I used `react-grid-layout` to make widgets draggable and resizable. It also handles layout saving and responsiveness for mobile, tablet, and desktop views.

6. **Error Handling**  
   Wrapped the dashboard in an `ErrorBoundary` to avoid crashes from unexpected widget bugs. Also, if the WebSocket fails, the UI doesn’t break — instead, it shows a clear “disconnected” screen.


-----

**Project Structure:**
```
📦 
├─ .gitignore
├─ Backend
│  └─ server.js
├─ README.md
├─ package-lock.json
├─ package.json
├─ public
│  ├─ favicon.ico
│  ├─ index.html
│  ├─ logo192.png
│  ├─ logo512.png
│  ├─ manifest.json
│  └─ robots.txt
└─ src
   ├─ App.css
   ├─ App.js
   ├─ App.test.js
   ├─ components
   │  ├─ AddWidgetModal.jsx
   │  ├─ ContextMenu.jsx
   │  ├─ Dashboard.jsx
   │  ├─ EditButton.jsx
   │  ├─ ErrorBoundary.jsx
   │  ├─ ThemeToggle.jsx
   │  ├─ WidgetSettingsModal.jsx
   │  └─ widgets
   │     ├─ GaugeWidget.jsx
   │     ├─ KeyMetricWidget.jsx
   │     ├─ LineChartWidget.jsx
   │     └─ index.js
   ├─ index.css
   ├─ index.js
   ├─ logo.svg
   ├─ reportWebVitals.js
   ├─ setupTests.js
   ├─ store
   │  └─ dashboardStore.js
   └─ utils
      ├─ dataSimulator.js
      └─ localStorage.js
```


**⚙️ Setup and Installation**

**1. Clone the Repository**

git clone https://github.com/xtusharx1/monitoringapp

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
## 🧪 Usage

This real-time dashboard helps visualize system metrics with customizable, interactive widgets.

---

### ➕ Add a Widget

1. Click the **"Add Widget"** button in the top-right corner.
2. Select a **widget type**:
   - Line Chart 📊  
   - Gauge 📈  
   - Key Metric 🔢
3. Choose a **metric** (e.g., CPU, Memory, etc.).
4. Set the **refresh interval**.
5. Click **"Add"** to place the widget on the dashboard.

> ℹ️ Metrics are limited for now, but the structure supports dynamic additions through the dropdown.

---

### 🎛️ Customize the Dashboard

- 🧲 **Drag and Resize**:  
  - Move widgets anywhere using drag-and-drop  
  - Resize from edges or corners  
  - Overlapping is **automatically prevented** for clean layout
- 🖱️ **Right-Click Context Menu**:  
  - Right-click a widget to open options  
  - Use **"Delete"** to remove it
- 🌓 **Light/Dark Theme Toggle**:  
  - Switch between themes using the toggle in the header

---

### 💾 Persistence with localStorage

- Your dashboard state (widgets, size, layout, selected metrics) is automatically saved using `localStorage`
- Everything stays intact even after refreshing or reopening the browser

---

### 🔌 WebSocket Disconnection Handling

- If the app fails to connect to the WebSocket server, a **graceful full-screen error UI** is displayed  
- No data or widgets are lost — just a clean notification of the issue

---

### 📱 Mobile Friendly

- The dashboard is **fully responsive**  
  - Tested on mobile, tablet, and desktop  
  - Widgets resize and rearrange to fit all screen sizes
-----
**🌙 Theme Toggle**

Click the sun/moon icon in the top-right corner to switch between light and dark themes.

-----

**🎥 Demo**

A screen recording demonstrating the application's features is available here:

🔗 [Watch the demo on Google Drive](https://drive.google.com/file/d/1ajFjPpW71xYxYevriZ9B0cJtHgJkHTNP/view?usp=sharing)

The video covers:
- 📦 Adding, editing, and removing widgets
- 🖱️ Context menu with right-click (Delete a Widget)
- 🧲 Drag & resize widget functionality with overlap prevention
- 🌙 Light/Dark mode toggle
- ♻️ Real-time data simulation
- 💾 **Persistence using localStorage** – layout, widget types, and settings are saved
- 🔌 Graceful handling of WebSocket disconnection
- 📱 Fully responsive layout for mobile, tablet, and desktop

---
## ⚠️ Known Issues

- 🔌 **No backend data fallback**: If the WebSocket server is not running, real-time data isn’t available. A clean and well-designed error screen is shown instead of breaking the UI.
- 🐢 **Performance may drop** if many widgets are added, especially on lower-end devices.
- 📱 **Minor layout bugs** may appear on very small screen sizes.
- 🌐 **Local-only storage**: Dashboard settings are stored in `localStorage`, so they’re not synced across browsers or devices.

---

## 🚀 Future Improvements

- 🔁 **Connect to real system metrics** – Replace simulated data with actual system info like CPU, memory usage, etc., fetched from a backend.
- ☁️ **Add login and cloud sync** – Allow users to save their dashboard layout online and access it from anywhere.
- 🧲 **Improve layout snapping** – Add grid or snapping support so widgets align perfectly while moving/resizing.
- 📤 **Export & import dashboard layouts** – Enable sharing or backing up custom layouts using downloadable/uploadable JSON.
- 🧩 **Widget & metric customization** – Right now, users can only choose from a limited set of widgets and metrics, but the UI is designed so new ones can easily be added through the dropdown. Long-term goal is to let users define and create their own widgets dynamically.

