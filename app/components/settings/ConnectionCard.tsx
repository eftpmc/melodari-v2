"use client";

import React from 'react';
import { LucideX, LucidePlugZap, LucideRefreshCw } from 'lucide-react';

interface ConnectionCardProps {
  icon: React.ReactNode;
  accountName: string;
  isConnected: boolean;
  status: string;
  onConnect: () => void;
  onDisconnect: () => void;
  loading: boolean;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  icon,
  accountName,
  isConnected,
  status,
  onConnect,
  onDisconnect,
  loading,
}) => {
  const handleButtonClick = () => {
    if (loading) return; // Prevent action if loading

    if (status === "Re-authentication required") {
      onConnect();
    } else if (isConnected) {
      onDisconnect();
    } else {
      onConnect();
    }
  };

  const renderButtonContent = () => {
    if (loading) {
      return "Connecting...";
    }
    
    if (status === "Re-authentication required") {
      return (
        <div className="flex items-center space-x-2">
          <span>Refresh</span>
          <LucideRefreshCw className="w-4 h-4 group-hover:animate-spin" />
        </div>
      );
    }

    if (isConnected) {
      return (
        <div className="flex items-center space-x-2">
          <span>Disconnect</span>
          <LucideX className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <span>Connect</span>
        <LucidePlugZap className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
      </div>
    );
  };

  return (
    <div className="flex items-center p-4 bg-base-100 rounded-lg shadow">
      {icon}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-base-content">{accountName}</h3>
        <p className="text-sm text-gray-500">
          {isConnected ? status : "Not Connected"}
        </p>
      </div>
      <button
        onClick={handleButtonClick}
        className={`btn btn-sm text-base-100 flex items-center group ${
          status === "Re-authentication required"
            ? "btn-warning"
            : isConnected
            ? "btn-error"
            : "btn-success"
        }`}
        disabled={loading}
      >
        {renderButtonContent()}
      </button>
    </div>
  );
};

export default ConnectionCard;
