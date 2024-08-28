"use client";

import React from 'react';

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText: string; // Add this prop
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ show, title, message, onConfirm, onCancel, confirmButtonText }) => {
  if (!show) return null;

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
            onClick={onConfirm}
            className="btn btn-error"
          >
            {confirmButtonText} {/* Use the dynamic button text */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;