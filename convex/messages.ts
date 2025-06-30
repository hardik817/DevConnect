import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { auth } from "./auth";
import { Doc, Id } from "./_generated/dataModel";
import { timeStamp } from "console";
import { paginationOptsValidator } from "convex/server";

const populateThread = async (ctx: QueryCtx, messageId: Id<"messages">) => {
    const messages = await ctx.db
        .query("messages")
        .withIndex("by_parent_message_id", (q) => q.eq("parentMessageId", messageId))
        .collect();

    if (messages.length === 0) {
        return {
            count: 0,
            image: undefined,
            timestamp: 0,
            name: "" // fixed to match naming throughout
        };
    }

    const lastMessage = messages[messages.length - 1];

    // Handle both member messages and bot messages
    if (!lastMessage.memberId && !lastMessage.botId) {
        return {
            count: 0,
            image: undefined,
            timestamp: 0,
            name: ""
        };
    }

    let lastMessageUser = null;

    // If it's a member message
    if (lastMessage.memberId) {
        const lastMessageMember = await populateMember(ctx, lastMessage.memberId);
        if (lastMessageMember) {
            lastMessageUser = await populateUser(ctx, lastMessageMember.userId);
        }
    }
    // If it's a bot message
    else if (lastMessage.botId) {
        const bot = await ctx.db.get(lastMessage.botId);
        if (bot) {
            lastMessageUser = {
                _id: bot._id,
                name: bot.name || "AI",
                image: bot.image,
                _creationTime: bot._creationTime,
            };
        }
    }

    if (!lastMessageUser) {
        return {
            count: 0,
            image: undefined,
            timestamp: 0,
            name: ""
        };
    }

    return {
        count: messages.length,
        image: lastMessageUser?.image,
        timestamp: lastMessage._creationTime ?? 0,
        name: lastMessageUser?.name
    };
};

const populateReactions = (ctx: QueryCtx, messageId: Id<"messages">) => {
    return ctx.db.query("reactions").withIndex("by_message_id", (q) => q.eq("messageId", messageId)).collect()
}

const populateUser = (ctx: QueryCtx, userId: Id<"users">) => {
    return ctx.db.get(userId);
}
const populateMember = (ctx: QueryCtx, memberId: Id<"members">) => {
    return ctx.db.get(memberId);
}
const getMember = async (
    ctx: QueryCtx,
    workspaceId: Id<"workspaces">,
    userId: Id<"users">
) => {
    return ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", workspaceId).eq("userId", userId)).unique()
}
export const get = query({
    args: {
        channelId: v.optional(v.id("channels")),
        conversationId: v.optional(v.id("conversations")),
        parentMessageId: v.optional(v.id("messages")),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }

        let _converstionId = args.conversationId;

        if (!args.conversationId && !args.channelId && args.parentMessageId) {
            const parentMessage = await ctx.db.get(args.parentMessageId);
            if (!parentMessage) {
                throw new Error("Parent message not found");
            }

            _converstionId = parentMessage.conversationId;
        }

        const results = await ctx.db
            .query("messages")
            .withIndex("by_channel_id_parent_message_id_conversation_id", (q) =>
                q
                    .eq("channelId", args.channelId)
                    .eq("parentMessageId", args.parentMessageId)
                    .eq("conversationId", _converstionId)
            )
            .order("desc")
            .paginate(args.paginationOpts);

        return {
            ...results,
            page: (
                await Promise.all(
                    results.page.map(async (message) => {
                        let user = null;
                        let member = null;

                        if (message.memberId) {
                            member = await populateMember(ctx, message.memberId);
                            user = member ? await populateUser(ctx, member.userId) : null;
                            if (!member || !user) return null;
                        }

                        if (message.botId) {
                            const bot = await ctx.db.get(message.botId);
                            if (bot) {
                                user = {
                                    _id: bot._id,
                                    name: bot.name || "AI",
                                    image: bot.image,
                                    _creationTime: bot._creationTime,
                                };
                            }
                        }

                        if (!user) return null;

                        const reactions = await populateReactions(ctx, message._id);
                        const thread = await populateThread(ctx, message._id);
                        const image = message.image
                            ? await ctx.storage.getUrl(message.image)
                            : undefined;

                        const reactionsWithCounts = reactions.map((reaction) => ({
                            ...reaction,
                            count: reactions.filter((r) => r.value === reaction.value).length,
                        }));

                        const deducedReactions = reactionsWithCounts.reduce(
                            (acc, reaction) => {
                                const existing = acc.find((r) => r.value === reaction.value);
                                if (existing) {
                                    existing.memberIds = Array.from(
                                        new Set([...existing.memberIds, reaction.memberId])
                                    );
                                } else {
                                    acc.push({ ...reaction, memberIds: [reaction.memberId] });
                                }
                                return acc;
                            },
                            [] as (Doc<"reactions"> & {
                                count: number;
                                memberIds: Id<"members">[];
                            })[]
                        );

                        const reactionsWithoutMemberIdProperty = deducedReactions.map(
                            ({ memberId, ...rest }) => rest
                        );

                        return {
                            ...message,
                            member,
                            user,
                            reactions: reactionsWithoutMemberIdProperty,
                            threadCount: thread.count,
                            threadImage: thread.image,
                            threadName: thread.name,
                            threadTimestamp: thread.timestamp,
                            image,
                        };
                    })
                )
            ).filter(
                (message): message is NonNullable<typeof message> => message !== null
            ),
        };
    },
});

export const getById = query({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            return null;
        }

        const message = await ctx.db.get(args.messageId);

        if (!message) {
            return null;
        }
        const member = await getMember(ctx, message.workspaceId, userId);
        if (!member) {
            return null;
        }

        const currentMember = await getMember(ctx, message.workspaceId, userId)
        if (!currentMember) {
            return null;
        }
        const user = await populateUser(ctx, member.userId);
        if (!user) {
            return null
        }

        const reactions = await populateReactions(ctx, message._id)
        const reactionsWithCounts = reactions.map((reaction) => {
            return {
                ...reaction,
                count: reactions.filter((r) => r.value === reaction.value).length
            };
        });
        const deducedReactions = reactionsWithCounts.reduce(
            (acc, reaction) => {
                const existingReaction = acc.find(
                    (r) => r.value === reaction.value
                );
                if (existingReaction) {
                    existingReaction.memberIds = Array.from(
                        new Set([...existingReaction.memberIds, reaction.memberId])
                    );
                } else {
                    acc.push({ ...reaction, memberIds: [reaction.memberId] });
                }
                return acc;
            },
            [] as (Doc<"reactions"> & {
                count: number;
                memberIds: Id<"members">[];
            })[]
        );

        const reactionsWithoutMemberIdProperty = deducedReactions.map(
            ({ memberId, ...rest }) => rest,
        )

        return {
            ...message,
            member,
            user,
            reactions: reactionsWithoutMemberIdProperty,
            image: message.image ? await ctx.storage.getUrl(message.image) : undefined,
        };
    }
})
export const update = mutation({
    args: {
        id: v.id("messages"),
        body: v.string()
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const message = await ctx.db.get(args.id);

        if (!message) {
            throw new Error("Message not found")
        }
        const member = await getMember(ctx, message.workspaceId, userId);
        if (!member || member._id !== message.memberId) {
            throw new Error("Unauthorized");
        }
        await ctx.db.patch(args.id, {
            body: args.body,
            updatedAt: Date.now(),
        })

        return args.id
    },
})
export const create = mutation({
    args: {
        body: v.string(),
        image: v.optional(v.id("_storage")),
        workspaceId: v.id("workspaces"),
        parentMessageId: v.optional(v.id("messages")),
        channelId: v.optional(v.id("channels")),
        conversationId: v.optional(v.id("conversations")),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) {
            throw new Error("Unauthorized")
        }
        const member = await getMember(ctx, args.workspaceId, userId)
        if (!member) {
            throw new Error("Unauthorized")
        }
        let _converstionId = args.conversationId

        if (!args.conversationId && !args.channelId && args.parentMessageId) {
            const parentMessage = await ctx.db.get(args.parentMessageId)

            if (!parentMessage) {
                throw new Error("Parent message not found")
            }

            _converstionId = parentMessage.conversationId
        }
        const messageId = await ctx.db.insert("messages", {
            memberId: member._id,
            body: args.body,
            image: args.image,
            channelId: args.channelId,
            conversationId: _converstionId,
            workspaceId: args.workspaceId,
            parentMessageId: args.parentMessageId
        })
        return messageId
    },
})
export const remove = mutation({
    args: {
        id: v.id("messages")
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const message = await ctx.db.get(args.id);

        if (!message) {
            throw new Error("Message not found")
        }
        const member = await getMember(ctx, message.workspaceId, userId);
        if (!member || member._id !== message.memberId) {
            throw new Error("Unauthorized");
        }
        await ctx.db.delete(args.id)

        return args.id
    },
})
export const createviaAi = mutation({
    args: {
        body: v.string(),
        image: v.optional(v.id("_storage")),
        workspaceId: v.id("workspaces"),
        parentMessageId: v.optional(v.id("messages")),
        channelId: v.optional(v.id("channels")),
        conversationId: v.optional(v.id("conversations")),
    },
    handler: async (ctx, args) => {

        const bot = await ctx.db.query("bots").withIndex("by_workspace_id", q => q.eq("workspaceId", args.workspaceId)).first()
        if (!bot) {
            throw new Error("Bot not found or unauthorized")
        }
        let _converstionId = args.conversationId

        if (!args.conversationId && !args.channelId && args.parentMessageId) {
            const parentMessage = await ctx.db.get(args.parentMessageId)

            if (!parentMessage) {
                throw new Error("Parent message not found")
            }

            _converstionId = parentMessage.conversationId
        }
        const messageId = await ctx.db.insert("messages", {
            botId: bot._id,
            body: args.body,
            image: args.image,
            channelId: args.channelId,
            conversationId: _converstionId,
            workspaceId: args.workspaceId,
            parentMessageId: args.parentMessageId
        })
        return messageId
    },
})