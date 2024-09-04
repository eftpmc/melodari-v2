"use client";

import React from 'react';
import { LogOut, LogIn, XCircle } from 'lucide-react'; // Import more icons as needed

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText: string;
  Icon: React.ComponentType; // New prop for the dynamic icon
}

interface IconProps {
  className?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ show, title, message, onConfirm, onCancel, confirmButtonText, Icon }) => {
  if (!show) return null;

  const handleConfirm = () => {
    onConfirm();
    onCancel();
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
            onClick={handleConfirm}
            className="btn bg-base-content hover:bg-primary rounded-full text-base-200 flex items-center group shadow-md border-none"
          >
            <span>{confirmButtonText}</span>
            <div className='transition-transform duration-300 transform scale-75 group-hover:rotate-12'>
              <Icon/>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
