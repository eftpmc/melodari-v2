"use client";

import React, { useState } from 'react';
import ConfirmDialog from '@/app/components/ConfirmDialog';
import ProfileSettings from '@/app/components/settings/ProfileSettings';
import Connections from '@/app/components/settings/Connections';

const SettingsPage: React.FC = () => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [disconnectAccount, setDisconnectAccount] = useState<"google" | "spotify" | null>(null);

    const handleDisconnectClick = (account: "google" | "spotify") => {
        setDisconnectAccount(account);
        setShowConfirmDialog(true);
    };

    const handleConfirmDisconnect = async () => {
        try {
            // Logic to disconnect based on the selected account
            if (disconnectAccount) {
                // Add your disconnect logic here
            }
        } catch (error) {
            console.error(`Error during ${disconnectAccount} disconnect:`, error);
        } finally {
            setShowConfirmDialog(false);
        }
    };

    return (
        <div className="min-h-screen p-8 bg-base-300">
            <h2 className="text-2xl font-semibold mb-4 text-base-content">Profile Settings</h2>
            <ProfileSettings />

            <h2 className="text-2xl font-semibold mb-4 text-base-content">Connections</h2>
            <Connections onDisconnectClick={handleDisconnectClick} />

            <ConfirmDialog
                show={showConfirmDialog}
                title={`Disconnect ${disconnectAccount === "google" ? "Google" : "Spotify"}`}
                message={`Disconnecting your account might remove you from services connected via this account.`}
                onConfirm={handleConfirmDisconnect}
                onCancel={() => setShowConfirmDialog(false)}
                confirmButtonText="Disconnect"
            />
        </div>
    );
};

export default SettingsPage;