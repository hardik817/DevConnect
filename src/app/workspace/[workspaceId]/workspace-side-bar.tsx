import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, HashIcon, Loader, MessageSquareText } from "lucide-react";
import { WorkSpaceHeader } from "./workspace-header";
import { SidebarItem } from "./sidebar-item";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { WorskSpaceSection } from "./workspace-section";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { UserItem } from "./user-item";
import { createChannelModalAtom } from "@/features/channels/store/use-create-channel-modal";
import { useChannelId } from "@/hooks/use-channel-id";
import { useMemberId } from "@/hooks/use-member-id";
import { useGetBots } from "@/features/bot/api/use-get-bot";
import { BotItem } from "./bot-item";
import { useBotId } from "@/hooks/use-bot-id";
export const WorkSpaceSideBar = () => {
    const workspaceId = useWorkspaceId();
    const channelId = useChannelId()
    const memberId = useMemberId()
    const botId = useBotId()
    const [_open, setopen] = createChannelModalAtom()

    const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });
    const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({ workspaceId });
    const { data: channels, isLoading: channelLoading } = useGetChannels({ workspaceId })
    const { data: members, isLoading: membersLoading } = useGetMembers({ workspaceId })
    const { data: bots, isLoading: botsLoading } = useGetBots({ workspaceId });
    if (workspaceLoading || memberLoading) {
        return (
            <div className="flex flex-col bg-[#5e2c5f] h-full items-center justify-center">
                <Loader className="size-5 animate-spin text-white" />
            </div>
        );
    }

    if (!workspace || !member) {
        return (
            <div className="flex flex-col gap-y-2 bg-[#5e2c5f] h-full items-center justify-center">
                <AlertTriangle className="size-5 text-white" />
                <p className="text-white text-sm">
                    Workspace not found
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-[#5e2c5f] h-full">
            <WorkSpaceHeader workspace={workspace} isAdmin={member.role === "admin"} />
            <div className="flex flex-col px-2 mt-3">
                <SidebarItem label="Threads" icon={MessageSquareText} id="Threads" />
                <SidebarItem label="Drafts & Sent" icon={MessageSquareText} id="Draft" />
            </div>
            <WorskSpaceSection
                label='Channels'
                hint="New Channel"
                onNew={() => member.role === "admin" ? setopen(true) : undefined}>
                {channels?.map((item) => (
                    <SidebarItem
                        key={item._id}
                        icon={HashIcon}
                        label={item.name}
                        id={item._id}
                        variant={channelId === item._id ? "active" : "default"}
                    />
                ))}
            </WorskSpaceSection>
            <WorskSpaceSection
                label='Direct Messages'
                hint="New Direct Message"
                onNew={() => { }}>
                {members?.map((item) =>
                (

                    <UserItem
                        key={item._id}
                        id={item._id}
                        label={item.user.name}
                        image={item.user.image}
                        variant={item._id === memberId ? "active" : "default"}
                    />

                ))}
            </WorskSpaceSection>
            <WorskSpaceSection
                label='Ai Assistant'
                hint="Chat with Ai"
                onNew={() => { }}>
                {bots?.map((item) =>
                (

                    <BotItem
                        key={item._id}
                        id={item._id}
                        label={item.name}
                        variant={item._id === botId ? "active" : "default"}
                    />

                ))}
            </WorskSpaceSection>
        </div>
    );
};
