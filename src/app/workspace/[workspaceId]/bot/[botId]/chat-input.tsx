'use client';

import { Loader } from 'lucide-react';
import dynamic from 'next/dynamic';
import type Quill from 'quill';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import type { Id } from '@/../convex/_generated/dataModel';
import { useCreateMessage } from '@/features/messages/api/use-create-message';
import { useGenerateUploadUrl } from '@/features/upload/api/use-generate-upload-url';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { api } from '../../../../../../convex/_generated/api';
import { useAction } from 'convex/react';
import { usePanel } from '@/hooks/use-panel';

const Editor = dynamic(() => import('@/components/editor'), {
    ssr: false,
    loading: () => (
        <div className="flex h-full items-center justify-center">
            <Loader className="size-6 animate-spin text-muted-foreground" />
        </div>
    ),
});

interface ChatInputProps {
    placeholder?: string;
    conversationId: Id<'conversations'>;
}

type CreateMessageValues = {
    conversationId: Id<'conversations'>;
    workspaceId: Id<'workspaces'>;
    body: string;
    image?: Id<'_storage'>;
};

export const ChatInput = ({ placeholder, conversationId }: ChatInputProps) => {
    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);

    const innerRef = useRef<Quill | null>(null);

    const workspaceId = useWorkspaceId();

    const { mutate: createMessage } = useCreateMessage();
    const { mutate: generateUploadUrl } = useGenerateUploadUrl();

    const askGemini = useAction(api.ai.askGeminiAndCreateMessage);
    const { onOpenMessage } = usePanel()
    const handleSubmit = async ({ body, image }: { body: string; image: File | null }) => {
        try {
            setIsPending(true);
            innerRef.current?.enable(false);

            const values: CreateMessageValues = {
                conversationId,
                workspaceId,
                // parentMessageId: messageId,
                body,
                image: undefined,
            };

            let imageStorageId: string | undefined;

            if (image) {
                const url = await generateUploadUrl(
                    {},
                    {
                        throwError: true,
                    },
                );

                if (!url) throw new Error('URL not found.');

                const result = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-type': image.type },
                    body: image,
                });

                if (!result.ok) throw new Error('Failed to upload image.');

                const { storageId } = await result.json();

                values.image = storageId;
                imageStorageId = storageId; // Store for Gemini
            }

            const messageId = await createMessage(values, { throwError: true });

            await askGemini({
                prompt: body,
                workspaceId,
                parentMessageId: messageId,
                channelId: undefined,
                conversationId: conversationId,
                imageStorageId: imageStorageId, // Pass image storage ID
            });
            if (messageId) {
                onOpenMessage(messageId)
            }
            setEditorKey((prevKey) => prevKey + 1);
        } catch (error) {
            toast.error('Failed to send message.');
        } finally {
            setIsPending(false);
            innerRef?.current?.enable(true);
        }
    };

    return (
        <div className="w-full px-5">
            <Editor placeholder={placeholder} key={editorKey} onSubmit={handleSubmit} disabled={isPending} innerRef={innerRef} />
        </div>
    );
};