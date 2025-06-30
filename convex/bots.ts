import { v } from "convex/values"
import { query } from "./_generated/server"
import { auth } from "./auth"

export const get = query({
    args: { workspaceId: v.id("workspaces") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) {
            return null
        }

        const data = await ctx.db.query("bots").withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId)).collect()

        const bots = [] // is bot check karna hain
        for (const bot of data) {
            bots.push(bot)
        }


        return bots
    }
}

)