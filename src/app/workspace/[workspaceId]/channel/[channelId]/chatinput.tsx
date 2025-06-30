import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useAction } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useParentMessageId } from "@/features/messages/store/use-parent-message-id";
import { usePanel } from "@/hooks/use-panel";
import { useGetBots } from "@/features/bot/api/use-get-bot";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputProps {
    placeholder: string;
}

type CreateMessageValues = {
    channelId: Id<"channels">;
    workspaceId: Id<"workspaces">;
    body: string;
    image: Id<"_storage"> | undefined;
};

export const ChatInput = ({ placeholder }: ChatInputProps) => {
    const editorRef = useRef<Quill | null>(null);
    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);

    const workspaceId = useWorkspaceId();
    const channelId = useChannelId();
    const { data: botId } = useGetBots({ workspaceId });

    const { mutate: generateUploadUrl } = useGenerateUploadUrl();
    const { mutate: createMessage } = useCreateMessage();
    const askGemini = useAction(api.ai.askGeminiAndCreateMessage);

    const [parentMessageId2] = useParentMessageId();
    const { onOpenMessage } = usePanel();

    const handleSubmit = async ({
        body,
        image,
    }: {
        body: string;
        image: File | null;
    }) => {
        try {
            setIsPending(true);
            editorRef?.current?.enable(false);

            const values: CreateMessageValues = {
                channelId,
                workspaceId,
                body,
                image: undefined,
            };

            let imageStorageId: string | undefined;

            if (image) {
                const url = await generateUploadUrl({}, { throwError: true });

                if (!url) throw new Error("URL not found.");

                const result = await fetch(url, {
                    method: "POST",
                    headers: { "Content-type": image.type },
                    body: image,
                });

                if (!result.ok) throw new Error("Failed to upload image.");

                const { storageId } = await result.json();
                values.image = storageId;
                imageStorageId = storageId;
            }

            const messageId = await createMessage(values, { throwError: true });

            if (body.toLowerCase().includes("@ai")) {
                await askGemini({
                    prompt: body,
                    workspaceId,
                    parentMessageId: messageId,
                    channelId,
                    conversationId: undefined,
                    imageStorageId,
                });

                if (messageId) {
                    onOpenMessage(messageId);
                }
            }

            setEditorKey((prevKey) => prevKey + 1);
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setIsPending(false);
            editorRef?.current?.enable(true);
        }
    };

    return (
        <div className="px-5 w-full">
            <Editor
                key={editorKey}
                placeholder={placeholder}
                onSubmit={handleSubmit}
                disabled={isPending}
                innerRef={editorRef}
            />
        </div>
    );
};
