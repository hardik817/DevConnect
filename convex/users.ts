import { query } from "./_generated/server";
import { auth } from "./auth";


export const get = query({
    args: {},
    handler: async (ctx) => {
        const user = await auth.getUserId(ctx);
        if (user === null) {
            return null
        }
        return await ctx.db.get(user);
    },
});

