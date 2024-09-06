import { query } from './_generated/server';

export const getLeagues = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('leagues').collect();
  },
});

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect();
  },
});
