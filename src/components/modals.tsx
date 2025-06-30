"use client"
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import { CreateChannelModal } from "@/features/channels/compnents/create-channel-model";
import { useState, useEffect } from "react";
export const Modals = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);
    if (!isMounted) {
        return null;
    }
    return (
        <>
            <CreateChannelModal />
            <CreateWorkspaceModal />
        </>
    );
};