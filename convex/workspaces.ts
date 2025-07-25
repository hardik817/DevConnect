import { error } from "console";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
const generateCode = () => {
    const code = Array.from(
        { length: 6 },
        () =>
            "0123456789abcdefghijklmnopqrst"[Math.floor(Math.random() * 36)]
    ).join("")
    return code
}
export const create = mutation({
    args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }
        const joinCode = generateCode()
        const workspaceId = await ctx.db.insert("workspaces", {
            name: args.name,
            userId,
            joinCode,
        });
        await ctx.db.insert("members", {
            userId,
            workspaceId,
            role: "admin"
        });

        await ctx.db.insert("bots", {
            workspaceId,
            name: "AI Assistant",
        });
        //kal bots ko get api ke through call karna aur phir usse members mein load karna hain
        await ctx.db.insert("channels", {
            name: "general",
            workspaceId: workspaceId
        })
        const workspace = await ctx.db.get(workspaceId)
        return workspaceId; // Return the workspace ID

    }
})
export const newJoinCode = mutation({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) {
            throw new Error("Unauthorized")
        }
        const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id", q => (q.eq("workspaceId", args.workspaceId).eq("userId", userId))).unique();
        if (!member || member.role !== "admin") {
            throw new Error("Unauthorized")
        }
        const joinCode = generateCode();
        await ctx.db.patch(args.workspaceId, { joinCode });
        return args.workspaceId
    }
})
export const join = mutation({
    args: {
        joinCode: v.string(),
        workspaceId: v.id("workspaces")
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) {
            throw new Error("Unauthorized")
        }
        const workspace = await ctx.db.get(args.workspaceId);
        if (!workspace) {
            throw new Error("Workspace doesn't exist")
        }
        if (workspace.joinCode !== args.joinCode.toLowerCase()) {
            throw new Error("Invalid join code")
        }
        const existingmember = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId)).unique()
        if (existingmember) {
            throw new Error("Existing member of this workspace")
        }
        await ctx.db.insert("members", {
            userId,
            workspaceId: workspace._id,
            role: "member"
        });
        return workspace._id
    }
})

export const get = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) {
            return []
        }
        const members = await ctx.db.query("members").withIndex("by_user_id", (q) => q.eq("userId", userId)).collect()
        const workspaceIds = members.map((member) => member.workspaceId)
        const workspaces = []
        for (const workspaceId of workspaceIds) {
            const workspace = await ctx.db.get(workspaceId)

            if (workspace) {
                workspaces.push(workspace)
            }
        }
        return workspaces; // Ensure workspaces are loaded
    },
});

export const getInfoById = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            return null
        }
        const existingmember = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId)).unique()
        const workspace = await ctx.db.get(args.workspaceId);
        return {
            name: workspace?.name,
            isMember: !!existingmember,
        }
    },
});

export const getById = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }
        const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId)).unique()
        if (!member) {
            return null
        }
        return await ctx.db.get(args.workspaceId);
    },
});

export const update = mutation(
    {
        args: {
            workspaceId: v.id("workspaces"),
            name: v.string()
        },
        handler: async (ctx, args) => {
            const userId = await auth.getUserId(ctx);
            if (!userId) {
                throw new Error("Unauthorized");
            }
            const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId)).unique()
            if (!member || member.role !== "admin") {
                throw new Error("Unauthorized")
            }

            await ctx.db.patch(args.workspaceId, {
                name: args.name,
            })
            return args.workspaceId
        }
    }
);

export const remove = mutation({
    args: {
        id: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) throw new Error('Unauthorized.');

        const member = await ctx.db
            .query('members')
            .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.id).eq('userId', userId))
            .unique();

        if (!member || member.role !== 'admin') throw new Error('Unauthorized.');

        const [members, channels, conversations, messages, reactions] = await Promise.all([
            ctx.db
                .query('members')
                .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.id))
                .collect(),
            ctx.db
                .query('channels')
                .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.id))
                .collect(),
            ctx.db
                .query('conversations')
                .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.id))
                .collect(),
            ctx.db
                .query('messages')
                .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.id))
                .collect(),
            ctx.db
                .query('reactions')
                .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.id))
                .collect(),
        ]);

        for (const member of members) await ctx.db.delete(member._id);
        for (const channel of channels) await ctx.db.delete(channel._id);
        for (const conversation of conversations) await ctx.db.delete(conversation._id);
        for (const message of messages) await ctx.db.delete(message._id);
        for (const reaction of reactions) await ctx.db.delete(reaction._id);

        await ctx.db.delete(args.id);

        return args.id;
    },
});