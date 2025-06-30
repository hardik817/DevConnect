import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { GoogleGenAI } from "@google/genai";

export const askGeminiAndCreateMessage = action({
    args: {
        prompt: v.string(),
        workspaceId: v.id("workspaces"),
        parentMessageId: v.optional(v.id("messages")),
        channelId: v.optional(v.id("channels")),
        conversationId: v.optional(v.id("conversations")),
        imageStorageId: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<Id<"messages">> => {
        try {
            // Initialize the AI client inside the handler where env vars are available
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("GEMINI_API_KEY environment variable is not set");
            }
            const ai = new GoogleGenAI({ apiKey });

            let model = "gemini-1.5-flash";
            let contents: any[] = [];

            if (args.imageStorageId) {
                // Use vision-capable model - try gemini-2.0-flash which has better vision support
                model = "gemini-2.0-flash";

                const imageUrl = await ctx.storage.getUrl(args.imageStorageId as Id<"_storage">);

                if (imageUrl) {

                    const imageResponse = await fetch(imageUrl);
                    if (!imageResponse.ok) {
                        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
                    }

                    const imageBuffer = await imageResponse.arrayBuffer();
                    const mimeType = imageResponse.headers.get('content-type');


                    // Validate MIME type
                    if (!mimeType || !mimeType.startsWith('image/')) {
                        throw new Error(`Invalid image type: ${mimeType}`);
                    }

                    const base64Data = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

                    // Follow the documentation: image first, then text
                    contents = [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        },
                        { text: args.prompt }
                    ];
                } else {
                    throw new Error("Could not get image URL from storage");
                }
            } else {
                // Text only - flat structure
                contents = [
                    { text: args.prompt }
                ];
            }


            const result = await ai.models.generateContent({
                model: model,
                contents: contents,
                config: {
                    systemInstruction: "You are an assisstant in a developer chat. Answer in a concise manner with a little explanation and if possible respond in markdown.",
                },
            });

            let response = "Sorry, connection error";
            try {
                response = await result.text || "Sorry, connection error";
            } catch (textError) {
                response = "Sorry, could not parse AI response";
            }

            const messageId: Id<"messages"> = await ctx.runMutation(api.messages.createviaAi, {
                body: response,
                workspaceId: args.workspaceId,
                parentMessageId: args.parentMessageId,
                channelId: args.channelId,
                conversationId: args.conversationId,
            });

            return messageId;
        } catch (error) {

            const errorMessageId: Id<"messages"> = await ctx.runMutation(api.messages.createviaAi, {
                body: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                workspaceId: args.workspaceId,
                parentMessageId: args.parentMessageId,
                channelId: args.channelId,
                conversationId: args.conversationId,
            });

            return errorMessageId;
        }
    },
});