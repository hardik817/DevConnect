"use client"

import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { createChannelModalAtom } from "@/features/channels/store/use-create-channel-modal";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Loader, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const WorkspaceIdPage = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId()
    const [open, setOpen] = createChannelModalAtom()
    const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({ workspaceId })
    const { data: channels, isLoading: channelLoading } = useGetChannels({ workspaceId })
    const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId })
    const channelId = useMemo(() => channels?.[0]?._id, [channels])
    const isAdmin = useMemo(() => member?.role === "admin", [member?.role])
    useEffect(() => {
        if (workspaceLoading || channelLoading || memberLoading || !member || !workspace) return
        if (channelId) {
            router.push(`/workspace/${workspaceId}/channel/${channelId}`)
        } else if (!open && isAdmin) {
            setOpen(true)
        }

    }, [channelId, channelLoading, workspace, workspaceLoading, open, setOpen, router, workspaceId, member, memberLoading])

    if (channelLoading || workspaceLoading || memberLoading) {
        return (
            <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
                <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
        )
    }
    if (!workspace || !member) {
        return (
            <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
                <TriangleAlert className="size-6  text-muted-foreground"></TriangleAlert>
                <span className="text-sm text-muted-foreground">Workspace not found</span>
            </div>
        )
    }
    return (
        <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
            <TriangleAlert className="size-6  text-muted-foreground"></TriangleAlert>
            <span className="text-sm text-muted-foreground">No channel Found</span>
        </div>
    )

}

export default WorkspaceIdPage;