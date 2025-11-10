import React from 'react';

// This is a reusable Modal component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null; 
  }

  return (
    // The dark backdrop
    <div className="modal-backdrop" onClick={onClose}>
      
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-button" onClick={onClose}>
            &times; 
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>

      </div>
    </div>
  );
}

export default Modal;

