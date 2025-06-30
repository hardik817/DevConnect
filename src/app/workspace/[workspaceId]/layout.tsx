"use client";
import { Loader } from "lucide-react";
import WorkspaceIdPage from "./page";
import { Toolbar } from "@/app/workspace/[workspaceId]/toolbar";
import { Sidebar } from "@/app/workspace/[workspaceId]/sidebar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { WorkSpaceSideBar } from "./workspace-side-bar";
import { usePanel } from "@/hooks/use-panel";
import { Id } from "../../../../convex/_generated/dataModel";
import { Thread } from "@/features/messages/components/thread";
import { Profile } from "@/features/members/components/profile";
import { useGetBots } from "@/features/bot/api/use-get-bot";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useBotId } from "@/hooks/use-bot-id";
interface WorkspaceIdLayoutProps {
    children: React.ReactNode;
}

const WorkspaceIDLayout = ({ children }: WorkspaceIdLayoutProps) => {
    const { parentMessageId, profileMemberId, onClose } = usePanel()
    const showPanel = !!parentMessageId || !!profileMemberId
    const botId = useBotId()
    return (
        <div className="h-full">
            <Toolbar />
            <div className="flex h-[calc(100vh-40px)] ">
                <Sidebar />
                <ResizablePanelGroup
                    direction="horizontal"
                    autoSaveId="hs-workspace-layout">
                    <ResizablePanel
                        defaultSize={20}
                        minSize={11}
                        className="bg-[#5e2c5f]">
                        <WorkSpaceSideBar />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel minSize={20} defaultSize={80}>
                        {children}
                    </ResizablePanel>
                    {
                        showPanel && (
                            <>
                                <ResizableHandle withHandle />

                                <ResizablePanel minSize={20} defaultSize={29}>
                                    {parentMessageId ? (
                                        botId ?
                                            <Thread messageId={parentMessageId as Id<'messages'>} botId={botId} onClose={onClose} /> :
                                            <Thread messageId={parentMessageId as Id<'messages'>} onClose={onClose} />
                                    ) : profileMemberId ? (
                                        <Profile memberId={profileMemberId as Id<'members'>} onClose={onClose} />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <Loader className="size-5 animate-spin text-muted-foreground" />
                                        </div>
                                    )}

                                </ResizablePanel>
                            </>
                        )
                    }
                </ResizablePanelGroup>

            </div>

        </div>
    )
}
export default WorkspaceIDLayout;