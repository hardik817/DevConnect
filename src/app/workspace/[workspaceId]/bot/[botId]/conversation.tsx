import { Loader } from 'lucide-react';

import type { Id } from '@/../convex/_generated/dataModel';
import { MessageList } from '@/components/message-list';
import { useGetMessages } from '@/features/messages/api/use-get-messages';
import { usePanel } from '@/hooks/use-panel';

import { ChatInput } from "./chat-input";
import { Header } from './header';
import { useBotId } from '@/hooks/use-bot-id';
import { useGetBots } from '@/features/bot/api/use-get-bot';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

interface ConversationProps {
    id: Id<'conversations'>;
}

export const Conversation = ({ id }: ConversationProps) => {
    const botId = useBotId();
    const workspaceId = useWorkspaceId();
    const { onOpenProfile } = usePanel();

    const { data: bots, isLoading: botLoading } = useGetBots({ workspaceId });
    const { results, status, loadMore } = useGetMessages({ conversationId: id });

    const bot = bots?.find((b) => b._id === botId);

    if (botLoading || status === 'LoadingFirstPage') {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!bot) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Bot not found.
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <Header
                memberName={bot.name}
                memberImage={bot.image}
                onClick={() => onOpenProfile(bot._id)} // Optional: You can disable if AI doesn't have profile
            />

            <MessageList
                data={results}
                variant="conversation"
                memberName={bot.name}
                memberImage={bot.image}
                loadMore={loadMore}
                canLoadMore={status === 'CanLoadMore'}
                isLoadingMore={status === 'LoadingMore'}
            />

            <ChatInput
                placeholder={`Message ${bot.name}`}
                conversationId={id}
            />
        </div>
    );
};
