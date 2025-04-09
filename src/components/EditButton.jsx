import React from 'react';
import { Settings } from 'lucide-react';

const EditButton = ({ widgetId, onEdit }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Edit button clicked for widget:', widgetId);
    if (onEdit) {
      onEdit(widgetId);
    }
    
    return false;
  };
  
  return (
    <button
      type="button"
      className="direct-edit-button"
      onClick={handleClick}
      title="Edit Widget Settings"
    >
      <Settings size={20} />
      <span>Edit Settings</span>
    </button>
  );
};

export default EditButton;