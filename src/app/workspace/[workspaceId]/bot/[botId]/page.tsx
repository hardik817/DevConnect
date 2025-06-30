'use client';

import { AlertTriangle, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { Id } from '@/../convex/_generated/dataModel';
import { useMemberId } from '@/hooks/use-member-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

import { Conversation } from './conversation';
import { useCreateOrGetConversationWithAi } from '@/features/conversations/api/use-create-or-get-conversation-with-ai';

const MemberIdPage = () => {
    const workspaceId = useWorkspaceId();

    const [conversationId, setConversationId] = useState<Id<'conversations'> | null>(null);

    const { mutate, isPending } = useCreateOrGetConversationWithAi();

    useEffect(() => {
        mutate(
            {
                workspaceId,
            },
            {
                onSuccess: (data) => setConversationId(data),
                onError: () => {
                    toast.error('Failed to create or get conversation.');
                },
            },
        );
    }, [workspaceId, mutate]);

    if (isPending) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!conversationId) {
        return (
            <div className="h-full flex-col items-center justify-center gap-y-2">
                <AlertTriangle className="size-6 text-muted-foreground" />

                <span className="text-sm text-muted-foreground">Conversation not found.</span>
            </div>
        );
    }

    return <Conversation id={conversationId} />;
};

export default MemberIdPage;