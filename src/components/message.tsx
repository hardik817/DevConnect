import { Divide } from "lucide-react";
import { Doc, Id } from "../../convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { format, isToday, isYesterday } from "date-fns";
import { Hint } from "./hint";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Thumbnail } from "./thumbnail";
import { Toolbar } from "./toolbar";
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";
import { useToggleReactions } from "@/features/reactions/api/use-toggle-reactions";
import { Reactions } from "./reactions";
import { usePanel } from "@/hooks/use-panel";
import { ThreadBar } from "./thread-bar";
import { useAction } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useEffect, useState } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useChannelId } from "@/hooks/use-channel-id";

const Renderer = dynamic(() => import("@/components/rendered"), { ssr: false });
const AiRenderer = dynamic(() => import("@/components/Ai-renderer"), { ssr: false });
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface MessageProps {
    id: Id<"messages">;
    memberId?: Id<"members">;
    botId?: Id<"bots">;
    authorImage?: string;
    authorName?: string;
    isAuthor: boolean;
    reactions: Array<
        Omit<Doc<"reactions">, "memberId"> & {
            count: number;
            memberIds: Id<"members">[];
        }
    >;
    body: Doc<"messages">["body"];
    image: string | null | undefined;
    updatedAt: Doc<"messages">["updatedAt"];
    createdAt: Doc<"messages">["_creationTime"];
    isEditing: boolean;
    setEditingId: (id: Id<"messages"> | null) => void;
    isCompact?: boolean;
    hideThreadButton?: boolean;
    threadCount?: number;
    threadImage?: string;
    threadName?: string;
    threadTimestamp?: number;
}

const formatFullTime = (date: Date) => {
    return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "hh:mm:ss a")}`;
};

export const Message = ({
    id,
    memberId,
    botId,
    authorImage,
    authorName = "member",
    isAuthor,
    reactions,
    body,
    image,
    updatedAt,
    createdAt,
    isEditing,
    setEditingId,
    isCompact,
    hideThreadButton,
    threadCount,
    threadImage,
    threadName,
    threadTimestamp,
}: MessageProps) => {
    const workspaceId = useWorkspaceId();
    const channelId = useChannelId();
    const { onOpenMessage, onClose, parentMessageId, onOpenProfile } = usePanel();

    const [ConfirmDialog, confirm] = useConfirm(
        "Delete Message",
        "Are you sure you want to delete this message? This cannot be undone."
    );

    const { mutate: updateMessage, isPending: isUpdatingMessage } = useUpdateMessage();
    const { mutate: removeMessage, isPending: isRemovingMessage } = useRemoveMessage();
    const { mutate: toggleReaction, isPending: isTogglingReaction } = useToggleReactions();

    const isPending = isUpdatingMessage || isTogglingReaction;
    const isAiMessage = !!botId;

    const handleReaction = (value: string) => {
        toggleReaction(
            { messageId: id, value },
            {
                onError: () => toast.error("Failed to toggle reaction"),
            }
        );
    };

    const handleUpdate = ({ body }: { body: string }) => {
        updateMessage(
            { id, body },
            {
                onSuccess: () => {
                    toast.success("Message Updated");
                    setEditingId(null);
                },
                onError: () => toast.error("Failed to update message"),
            }
        );
    };

    const handleDelete = async () => {
        const ok = await confirm();
        if (!ok) return;

        removeMessage(
            { id },
            {
                onSuccess: () => {
                    toast.success("Message deleted");
                    if (parentMessageId === id) onClose();
                },
                onError: () => toast.error("Failed to delete the message"),
            }
        );
    };

    const avatarFallback = authorName.charAt(0).toUpperCase();

    const renderAvatar = () => {
        if (isAiMessage) {
            return (
                <Avatar className="bg-muted">
                    <AvatarImage />
                    <AvatarFallback>🤖</AvatarFallback>
                </Avatar>
            );
        }

        if (memberId) {
            return (
                <button onClick={() => onOpenProfile(memberId)}>
                    <Avatar>
                        <AvatarImage src={authorImage} />
                        <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                </button>
            );
        }

        return null;
    };

    const renderAuthorName = () => {
        if (isAiMessage) {
            return <span className="font-bold text-purple-600">AI Assistant</span>;
        }

        if (memberId) {
            return (
                <button
                    onClick={() => onOpenProfile(memberId)}
                    className="font-bold text-primary hover:underline"
                >
                    {authorName}
                </button>
            );
        }

        return <span className="font-bold text-primary">{authorName}</span>;
    };

    const renderBody = () => {
        return isAiMessage ? <AiRenderer content={body} /> : <Renderer value={body} />;
    };

    return (
        <>
            <ConfirmDialog />

            <div
                className={cn(
                    "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
                    isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
                    isRemovingMessage && "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
                )}
            >
                <div className="flex items-start gap-2">
                    {renderAvatar()}

                    {isEditing ? (
                        <div className="w-full h-full">
                            <Editor
                                onSubmit={handleUpdate}
                                disabled={isPending}
                                defaultValue={JSON.parse(body)}
                                onCancel={() => setEditingId(null)}
                                variant="update"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col w-full overflow-hidden">
                            <div className="text-sm">
                                {renderAuthorName()}
                                <span>&nbsp;&nbsp;</span>
                                <Hint label={formatFullTime(new Date(createdAt))}>
                                    <button className="text-xs text-muted-foreground hover:underline">
                                        {format(new Date(createdAt), "h:mm a")}
                                    </button>
                                </Hint>
                            </div>

                            {renderBody()}

                            <Thumbnail url={image} />

                            {updatedAt ? (
                                <span className="text-xs text-muted-foreground">(edited)</span>
                            ) : null}

                            <Reactions data={reactions} onChange={handleReaction} />

                            <ThreadBar
                                count={threadCount}
                                image={threadImage}
                                name={threadName}
                                timestamp={threadTimestamp}
                                onClick={() => onOpenMessage(id)}
                            />
                        </div>
                    )}
                </div>

                {!isEditing && (
                    <Toolbar
                        isAuthor={isAuthor}
                        isPending={isPending}
                        handleEdit={() => setEditingId(id)}
                        handleThread={() => onOpenMessage(id)}
                        handleDelete={handleDelete}
                        handleReaction={handleReaction}
                        hideThreadButton={hideThreadButton}
                    />
                )}
            </div>
        </>
    );
};
