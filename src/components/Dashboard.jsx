import React, { useState, useRef, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { LineChartWidget, GaugeWidget, KeyMetricWidget } from './widgets';
import ThemeToggle from './ThemeToggle';
import AddWidgetModal from './AddWidgetModal';
import WidgetSettingsModal from './WidgetSettingsModal';
import { Plus, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const { widgets, updateWidgetPosition, updateWidgetSize, isDarkMode, toggleTheme, removeWidget } = useDashboardStore();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWidgetId, setEditingWidgetId] = useState(null);
  const [draggingWidget, setDraggingWidget] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [widgetStartPos, setWidgetStartPos] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState(null); 
  const [resizingWidget, setResizingWidget] = useState(null);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const [isMobileView, setIsMobileView] = useState(false);
  const [isTabletView, setIsTabletView] = useState(false);

  const dashboardRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobileView(width < 768);
      setIsTabletView(width >= 768 && width < 1200);
    };
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? '#121b27' : '#f3f4f6';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'auto';
    document.documentElement.style.backgroundColor = isDarkMode ? '#121b27' : '#f3f4f6';
  }, [isDarkMode]);
  
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };
    
    window.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

  const isOverlapping = (newPos, newSize, excludeId) => {
    const buffer = 2;
    if (isMobileView || isTabletView) return false;
    
    return widgets.some(widget => {
      if (widget.id === excludeId) return false;

      const widgetRect = {
        left: widget.position?.x || 0,
        top: widget.position?.y || 0,
        right: (widget.position?.x || 0) + (widget.size?.width || 300),
        bottom: (widget.position?.y || 0) + (widget.size?.height || 250),
      };

      const newRect = {
        left: newPos.x - buffer,
        top: newPos.y - buffer,
        right: newPos.x + newSize.width + buffer,
        bottom: newPos.y + newSize.height + buffer,
      };

      const isOverlap = !(
        newRect.right <= widgetRect.left ||
        newRect.left >= widgetRect.right ||
        newRect.bottom <= widgetRect.top ||
        newRect.top >= widgetRect.bottom
      );
      
      return isOverlap;
    });
  };
  
  const handleContextMenu = (e, widgetId) => {
    e.preventDefault();
    
    setContextMenu({
      widgetId,
      x: e.clientX,
      y: e.clientY
    });
  };
  
  const handleDeleteWidget = (widgetId) => {
    setContextMenu(null);
    removeWidget(widgetId);
  };

  const renderContextMenu = () => {
    if (!contextMenu) return null;
    
    return (
      <div 
        className="widget-context-menu"
        style={{
          top: `${contextMenu.y}px`,
          left: `${contextMenu.x}px`,
        }}
        onClick={(e) => e.stopPropagation()} 
      >
        <div 
          className="context-menu-item danger"
          onClick={() => handleDeleteWidget(contextMenu.widgetId)}
        >
          <Trash2 size={16} />
          Delete Widget
        </div>
      </div>
    );
  };

  const handleWidgetDragStart = (e, widgetId) => {
    if (isMobileView || isTabletView) return;
    if (e.button !== 0) return;
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    setDragStart({ x: e.clientX, y: e.clientY });
    setWidgetStartPos({
      x: widget.position?.x || 0,
      y: widget.position?.y || 0
    });

    setDraggingWidget(widgetId);
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (isMobileView || isTabletView) return;
    
    if (draggingWidget) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const newX = widgetStartPos.x + deltaX;
      const newY = widgetStartPos.y + deltaY;

      const widget = widgets.find(w => w.id === draggingWidget);
      const widgetWidth = widget.size?.width || 300;
      const widgetHeight = widget.size?.height || 250;

      const boundedX = Math.max(0, newX);
      const boundedY = Math.max(0, newY); 
      const widgetElement = document.getElementById(`widget-${draggingWidget}`);
      if (widgetElement) {
        widgetElement.style.left = `${boundedX}px`;
        widgetElement.style.top = `${boundedY}px`;
        
        document.querySelectorAll('.widget-overlap').forEach(el => {
          if (el.id !== `widget-${draggingWidget}`) {
            el.classList.remove('widget-overlap');
          }
        });
        
        const hasOverlap = isOverlapping(
          { x: boundedX, y: boundedY }, 
          { width: widgetWidth, height: widgetHeight }, 
          draggingWidget
        );
        
        if (hasOverlap) {
          widgetElement.classList.add('widget-overlap');
        } else {
          widgetElement.classList.remove('widget-overlap');
        }
      }
    }

    if (resizingWidget) {
      const widget = widgets.find(w => w.id === resizingWidget);
      if (!widget) return;

      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;

      let newWidth = resizeStartSize.width;
      let newHeight = resizeStartSize.height;
      let newX = widgetStartPos.x;
      let newY = widgetStartPos.y;

      if (resizeDirection.includes('e')) {
        newWidth = Math.max(200, resizeStartSize.width + deltaX);
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(150, resizeStartSize.height + deltaY);
      }
      if (resizeDirection.includes('w')) {
        newWidth = Math.max(200, resizeStartSize.width - deltaX);
        newX = widgetStartPos.x + deltaX;
      }
      if (resizeDirection.includes('n')) {
        newHeight = Math.max(150, resizeStartSize.height - deltaY);
        newY = widgetStartPos.y + deltaY;
      }

      const boundedX = Math.max(0, newX);
      const boundedY = Math.max(0, newY);

      document.querySelectorAll('.widget-overlap').forEach(el => {
        if (el.id !== `widget-${resizingWidget}`) {
          el.classList.remove('widget-overlap');
        }
      });
      
      const widgetElement = document.getElementById(`widget-${resizingWidget}`);
      if (widgetElement) {
        widgetElement.style.width = `${newWidth}px`;
        widgetElement.style.height = `${newHeight}px`;
        widgetElement.style.left = `${boundedX}px`;
        widgetElement.style.top = `${boundedY}px`;
        
        const hasOverlap = isOverlapping(
          { x: boundedX, y: boundedY }, 
          { width: newWidth, height: newHeight }, 
          resizingWidget
        );
        
        if (hasOverlap) {
          widgetElement.classList.add('widget-overlap');
        } else {
          widgetElement.classList.remove('widget-overlap');
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (isMobileView || isTabletView) return;
    
    if (draggingWidget) {
      const widgetElement = document.getElementById(`widget-${draggingWidget}`);
      if (widgetElement) {
        const left = parseInt(widgetElement.style.left) || 0;
        const top = parseInt(widgetElement.style.top) || 0;
        
        const widget = widgets.find(w => w.id === draggingWidget);
        const widgetWidth = widget.size?.width || 300;
        const widgetHeight = widget.size?.height || 250;
        
        const hasOverlap = isOverlapping(
          { x: left, y: top }, 
          { width: widgetWidth, height: widgetHeight }, 
          draggingWidget
        );
        
        if (hasOverlap) {
          widgetElement.style.left = `${widgetStartPos.x}px`;
          widgetElement.style.top = `${widgetStartPos.y}px`;
          
          widgetElement.getBoundingClientRect();
        } else {
          updateWidgetPosition(draggingWidget, { x: left, y: top });
        }
      }

      setDraggingWidget(null);
    }

    if (resizingWidget) {
      const widgetElement = document.getElementById(`widget-${resizingWidget}`);
      if (widgetElement) {
        const width = parseInt(widgetElement.style.width);
        const height = parseInt(widgetElement.style.height);
        const left = parseInt(widgetElement.style.left) || 0;
        const top = parseInt(widgetElement.style.top) || 0;
        
        const hasOverlap = isOverlapping(
          { x: left, y: top }, 
          { width, height }, 
          resizingWidget
        );
        
        if (hasOverlap) {
          widgetElement.style.width = `${resizeStartSize.width}px`;
          widgetElement.style.height = `${resizeStartSize.height}px`;
          widgetElement.style.left = `${widgetStartPos.x}px`;
          widgetElement.style.top = `${widgetStartPos.y}px`;
          
          widgetElement.getBoundingClientRect();
        } else {
          updateWidgetSize(resizingWidget, { width, height });
          updateWidgetPosition(resizingWidget, { x: left, y: top });
        }
      }

      document.querySelectorAll('.resize-handle-active').forEach(el => {
        el.classList.remove('resize-handle-active');
      });

      setResizingWidget(null);
      setResizeDirection(null);
    }

    document.body.style.userSelect = '';
    
    setTimeout(() => {
      document.querySelectorAll('.widget-overlap').forEach(el => {
        el.classList.remove('widget-overlap');
      });
    }, 0);
  };

  const handleResizeStart = (e, widgetId, direction) => {
    if (isMobileView || isTabletView) return;
    
    e.stopPropagation();
    e.preventDefault();

    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    setResizingWidget(widgetId);
    setResizeDirection(direction);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize({
      width: widget.size?.width || 300,
      height: widget.size?.height || 250,
    });
    setWidgetStartPos({
      x: widget.position?.x || 0,
      y: widget.position?.y || 0,
    });

    const handle = e.target;
    handle.classList.add('resize-handle-active');

    document.body.style.userSelect = 'none';
  };

  const renderResizeHandles = (widgetId) => {
    if (isMobileView || isTabletView) return null;
    
    const directions = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    return directions.map((dir) => (
      <div
        key={dir}
        className={`resize-handle resize-${dir}`}
        onMouseDown={(e) => handleResizeStart(e, widgetId, dir)}
      ></div>
    ));
  };

  const renderWidget = (widget) => {
    const { id, type } = widget;

    const widgetProps = {
      widget,
      onSettingsClick: () => setEditingWidgetId(id),
      forceVisualizationType: type,
    };

    const style = isMobileView || isTabletView 
      ? {
          minHeight: '250px',
          height: '100%',
          width: '100%',
        }
      : {
          position: 'absolute',
          left: `${widget.position?.x || 0}px`,
          top: `${widget.position?.y || 0}px`,
          width: `${widget.size?.width || 300}px`,
          height: `${widget.size?.height || 250}px`,
        };

    let widgetComponent;
    switch (type) {
      case 'line_chart':
        widgetComponent = <LineChartWidget {...widgetProps} />;
        break;
      case 'gauge':
        widgetComponent = <GaugeWidget {...widgetProps} />;
        break;
      case 'key_metric':
        widgetComponent = <KeyMetricWidget {...widgetProps} />;
        break;
      default:
        widgetComponent = <div>Unknown widget type: {type}</div>;
    }

    const handleWidgetInteraction = isMobileView || isTabletView
      ? {
          onContextMenu: (e) => handleContextMenu(e, id),
        }
      : {
          onMouseDown: (e) => {
            if (e.button === 0) {
              handleWidgetDragStart(e, id);
            }
          },
          onContextMenu: (e) => handleContextMenu(e, id),
          onMouseOver: (e) => {
            const widgetRect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - widgetRect.left;
            const mouseY = e.clientY - widgetRect.top;
            
            const handles = e.currentTarget.querySelectorAll('.resize-handle');
            
            const edgeThreshold = 15;
            const isNearTop = mouseY <= edgeThreshold;
            const isNearBottom = mouseY >= widgetRect.height - edgeThreshold;
            const isNearLeft = mouseX <= edgeThreshold;
            const isNearRight = mouseX >= widgetRect.width - edgeThreshold;
            
            handles.forEach(handle => {
              handle.style.opacity = '0';
            });
            
            if (isNearTop && isNearLeft) {
              const nwHandle = e.currentTarget.querySelector('.resize-nw');
              if (nwHandle) nwHandle.style.opacity = '1';
            } else if (isNearTop && isNearRight) {
              const neHandle = e.currentTarget.querySelector('.resize-ne');
              if (neHandle) neHandle.style.opacity = '1';
            } else if (isNearBottom && isNearLeft) {
              const swHandle = e.currentTarget.querySelector('.resize-sw');
              if (swHandle) swHandle.style.opacity = '1';
            } else if (isNearBottom && isNearRight) {
              const seHandle = e.currentTarget.querySelector('.resize-se');
              if (seHandle) seHandle.style.opacity = '1';
            } else if (isNearTop) {
              const nHandle = e.currentTarget.querySelector('.resize-n');
              if (nHandle) nHandle.style.opacity = '1';
            } else if (isNearBottom) {
              const sHandle = e.currentTarget.querySelector('.resize-s');
              if (sHandle) sHandle.style.opacity = '1';
            } else if (isNearLeft) {
              const wHandle = e.currentTarget.querySelector('.resize-w');
              if (wHandle) wHandle.style.opacity = '1';
            } else if (isNearRight) {
              const eHandle = e.currentTarget.querySelector('.resize-e');
              if (eHandle) eHandle.style.opacity = '1';
            }
          },
          onMouseOut: (e) => {
            const handles = e.currentTarget.querySelectorAll('.resize-handle');
            handles.forEach(handle => {
              if (!handle.classList.contains('resize-handle-active')) {
                handle.style.opacity = '0';
              }
            });
          }
        };

    return (
      <div
        key={id}
        id={`widget-${id}`}
        className="widget-container"
        style={style}
        {...handleWidgetInteraction}
      >
        {widgetComponent}
        {!isMobileView && !isTabletView && renderResizeHandles(id)}
      </div>
    );
  };

  return (
    <div className="dashboard-wrapper">
      <div
        className={`dashboard ${isDarkMode ? 'dashboard-dark' : 'dashboard-light'}`}
        ref={dashboardRef}
        onMouseMove={isMobileView || isTabletView ? null : handleMouseMove}
        onMouseUp={isMobileView || isTabletView ? null : handleMouseUp}
        onMouseLeave={isMobileView || isTabletView ? null : handleMouseUp}
      >
        <header className="dashboard-header">
          <h1>Application Monitoring Dashboard</h1>
          <div className="dashboard-actions">
            <button
              className="btn btn-primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} /> Add Widget
            </button>
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </div>
        </header>

        <div className="widgets-container">
          {isMobileView || isTabletView ? (
            <div className="widgets-grid">
              {widgets.map((widget) => renderWidget(widget))}
            </div>
          ) : (
            widgets.map((widget) => renderWidget(widget))
          )}
        </div>

        <AddWidgetModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          isDarkMode={isDarkMode}
        />

        <WidgetSettingsModal
          widgetId={editingWidgetId}
          isOpen={editingWidgetId !== null}
          onClose={() => setEditingWidgetId(null)}
          isDarkMode={isDarkMode}
        />
        
        {renderContextMenu()}
      </div>
    </div>
  );
};

export default Dashboard;