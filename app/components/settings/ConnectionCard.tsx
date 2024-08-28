"use client";

import React from 'react';

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
  return (
    <div className="flex items-center p-4 bg-base-100 rounded-lg shadow">
      {icon}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-base-content">{accountName}</h3>
        <p className="text-sm text-gray-500">
          {isConnected
            ? status
            : "Not Connected"}
        </p>
      </div>
      <button
        onClick={isConnected ? onDisconnect : onConnect}
        className={`btn btn-sm text-base-100 ${status === "Re-authentication required" ? "btn-warning" : isConnected ? "btn-error" : "btn-success"}`}
        disabled={loading}
      >
        {loading
          ? "Connecting..."
          : status === "Re-authentication required"
            ? "Refresh"
            : isConnected
              ? "Disconnect"
              : "Connect"}
      </button>
    </div>
  );
};

export default ConnectionCard;