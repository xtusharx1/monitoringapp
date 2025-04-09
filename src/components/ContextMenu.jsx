import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const ContextMenu = ({ position, onClose, onRemove }) => {
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  return (
    <div 
      className="context-menu" 
      style={{ top: position.y, left: position.x }}
      ref={menuRef}
    >
      <button className="context-menu-item" onClick={onRemove}>
        <X size={16} />
        <span>Remove Widget</span>
      </button>
    </div>
  );
};

export default ContextMenu;