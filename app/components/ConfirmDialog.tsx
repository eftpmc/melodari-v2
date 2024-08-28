"use client";

import React from 'react';

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ show, title, message, onConfirm, onCancel, confirmButtonText }) => {
  if (!show) return null;

  const handleConfirm = () => {
    onConfirm(); // Call the confirm action
    onCancel();  // Close the dialog after confirming
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg text-base-content">{title}</h3>
        <p className="py-4 text-base-content">{message}</p>
        <div className="modal-action">
          <button
            onClick={onCancel}
            className="btn btn-base-content"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm} // Handle confirm and close
            className="btn btn-error"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;