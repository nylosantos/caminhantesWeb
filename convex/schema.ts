import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  leagues: defineTable({
    code: v.string(),
    createdBy: v.string(),
    games: v.array(
      v.object({
        AwayTeam: v.string(),
        AwayTeamScore: v.union(v.null(), v.float64()),
        DateUtc: v.string(),
        Group: v.union(v.null(), v.string()),
        HomeTeam: v.string(),
        HomeTeamScore: v.union(v.null(), v.float64()),
        Location: v.string(),
        MatchNumber: v.float64(),
        RoundNumber: v.float64(),
        active: v.optional(v.boolean()),
      })
    ),
    id: v.string(),
    logoUrl: v.string(),
    name: v.string(),
    participants: v.array(v.union(v.id('users'), v.null())),
    season: v.string(),
    slug: v.string(),
  }),
  users: defineTable({
    email: v.union(v.null(), v.string()),
    id: v.string(),
    leagues: v.array(
      v.object({
        guesses: v.array(
          v.object({
            AwayTeamScore: v.union(v.null(), v.float64()),
            HomeTeamScore: v.union(v.null(), v.float64()),
            MatchNumber: v.float64(),
            RoundNumber: v.float64(),
            points: v.float64(),
          })
        ),
        id: v.union(v.id('leagues'), v.null()),
        totalPoints: v.float64(),
      })
    ),
    name: v.union(v.null(), v.string()),
    phone: v.union(v.null(), v.string()),
    photo: v.union(v.null(), v.string()),
    role: v.string(),
  }),
});
