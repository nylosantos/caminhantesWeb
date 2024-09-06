import { ParticipantsWithPoints } from '../src/screens/PoolPage';
import { Doc, Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const findPoolToJoin = query({
  args: { leagueCode: v.string() },
  handler: async (ctx, args) => {
    const findLeague = await ctx.db
      .query('leagues')
      .filter((q) => q.eq(q.field('code'), args.leagueCode))
      .collect();

    return findLeague[0];
  },
});

export const findLeagueWithSlug = query({
  args: { leagueSlug: v.string() },
  handler: async (ctx, args) => {
    const findLeague = await ctx.db
      .query('leagues')
      .filter((q) => q.and(q.eq(q.field('slug'), args.leagueSlug)))
      .first();

    return findLeague;
  },
});

export const findLeagueWithSlugAndCreator = query({
  args: { leagueSlug: v.string(), leagueCreatedBy: v.string() },
  handler: async (ctx, args) => {
    const findLeague = await ctx.db
      .query('leagues')
      .filter((q) =>
        q.and(
          q.eq(q.field('slug'), args.leagueSlug),
          q.eq(q.field('createdBy'), args.leagueCreatedBy)
        )
      )
      .first();

    return findLeague;
  },
});

export const joinPool = mutation({
  args: {
    leagueId: v.id('leagues'),
    userId: v.id('users'),
    updatedLeagues: v.array(
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
  },
  handler: async (ctx, args) => {
    const { leagueId, userId, updatedLeagues } = args;
    const leagueData = await ctx.db
      .query('leagues')
      .filter((q) => q.eq(q.field('_id'), leagueId))
      .first();
    if (leagueData) {
      const leagueParticipantsData: (Id<'users'> | null)[] = leagueData.participants;
      await ctx.db.patch(leagueId, { participants: [...leagueParticipantsData, userId] });

      await ctx.db.patch(userId, {
        leagues: updatedLeagues,
      });
    }
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('_id'), userId))
      .first();
    if (user) {
      const leagues = user.leagues;
      const userPools = await getUserPools(ctx, { leagues });
      return userPools;
    }
  },
});

export const createUser = mutation({
  args: {
    displayName: v.union(v.null(), v.string()),
    email: v.union(v.null(), v.string()),
    phoneNumber: v.union(v.null(), v.string()),
    photoURL: v.union(v.null(), v.string()),
    role: v.string(),
    uid: v.string(),
  },
  handler: async (ctx, args) => {
    const { uid, displayName, email, phoneNumber, photoURL, role } = args;
    const userOrNull = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), email))
      .first();
    if (userOrNull === null) {
      await ctx.db.insert('users', {
        id: uid,
        name: displayName,
        email: email,
        leagues: [],
        phone: phoneNumber,
        photo: photoURL,
        role: role,
      });
    } else {
      return 'User Exists';
    }
  },
});

export const createLeague = mutation({
  args: {
    code: v.string(),
    id: v.string(),
    logoUrl: v.string(),
    name: v.string(),
    season: v.string(),
    slug: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const { code, id, logoUrl, name, season, slug, createdBy } = args;
    const leagueOrNull = await ctx.db
      .query('leagues')
      .filter((q) => q.eq(q.field('slug'), slug))
      .first();
    if (leagueOrNull === null) {
      await ctx.db.insert('leagues', {
        code,
        createdBy,
        games: [],
        id,
        logoUrl,
        name,
        participants: [],
        season,
        slug,
      });
    } else {
      return console.log('League Exists');
    }
  },
});

export const deleteLeague = mutation({
  args: { id: v.id('leagues') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const findUser = query({
  args: { id: v.optional(v.string()), type: v.union(v.literal('idString'), v.literal('_idDb')) },
  handler: async (ctx, args) => {
    const { id, type } = args;
    const userOrNull = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field(type === '_idDb' ? '_id' : 'id'), id))
      .first();
    return userOrNull;
  },
});

export const findLeaguesParticipants = query({
  args: {
    leagueId: v.id('leagues'),
  },
  handler: async (ctx, args) => {
    const leagueParticipants: ParticipantsWithPoints[] = [];
    const { leagueId } = args;
    const league = await ctx.db.get(leagueId);
    if (league) {
      for (let index = 0; index < league.participants.length; index++) {
        if (league.participants[index]) {
          const participantId = league.participants[index];
          if (participantId) {
            const participant = await ctx.db.get(participantId);
            if (participant !== null) {
              const userLeagueGuesses = participant.leagues.find(
                (league) => league.id === leagueId
              );
              if (userLeagueGuesses) {
                let totalPointsSum = 0;
                userLeagueGuesses.guesses.map(
                  (guess) => (totalPointsSum = totalPointsSum + guess.points)
                );
                leagueParticipants.push({ participant: participant, totalPoints: totalPointsSum });
              }
            }
          }
        }
      }
      return leagueParticipants;
    }
  },
});

export const getUserPools = query({
  args: {
    leagues: v.union(
      v.array(
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
      v.null()
    ),
  },
  handler: async (ctx, args) => {
    const { leagues } = args;
    const userLeagues: Doc<'leagues'>[] = [];
    if (leagues !== null) {
      for (let index = 0; index < leagues.length; index++) {
        const foundedLeague = await ctx.db
          .query('leagues')
          .filter((q) => q.eq(q.field('_id'), leagues[index].id))
          .first();
        if (foundedLeague) {
          userLeagues.push(foundedLeague);
        }
      }
      return userLeagues;
    }
  },
});

export const getUserPoolGuesses = query({
  args: { leagueId: v.id('leagues'), userId: v.id('users') },
  handler: async (ctx, args) => {
    const { leagueId, userId } = args;
    const userData = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('_id'), userId))
      .first();
    if (userData && userData.leagues) {
      const userLeagueGuesses = userData.leagues.find((league) => league.id === leagueId);
      if (userLeagueGuesses) {
        return userLeagueGuesses.guesses;
      }
    }
  },
});

export const updateDbUserGuesses = mutation({
  args: {
    league: v.object({
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
    }),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const { league, userId } = args;
    if (league !== null && userId !== null) {
      const userData = await ctx.db
        .query('users')
        .filter((q) => q.eq(q.field('_id'), userId))
        .first();
      if (userData) {
        const arrayChangedIndex = userData.leagues.findIndex(
          (userLeague) => userLeague.id === league.id
        );
        if (arrayChangedIndex !== -1) {
          const leagueGuessesWithoutChange = userData.leagues.filter(
            (oldLeague) => oldLeague.id !== league.id
          );
          await ctx.db.patch(userId, {
            leagues: [
              ...leagueGuessesWithoutChange,
              {
                id: league.id,
                guesses: league.guesses,
                totalPoints: league.totalPoints,
              },
            ],
          });
        }
      }
    }
  },
});

export const updateOneGuess = mutation({
  args: {
    guess: v.object({
      leagueId: v.id('leagues'),
      guess: v.object({
        AwayTeamScore: v.union(v.null(), v.float64()),
        HomeTeamScore: v.union(v.null(), v.float64()),
        MatchNumber: v.float64(),
        RoundNumber: v.float64(),
        points: v.float64(),
      }),
    }),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const { guess, userId } = args;
    const userData = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('_id'), userId))
      .first();
    if (userData) {
      const arrayChangedIndex = userData.leagues.findIndex(
        (userLeague) => userLeague.id === guess.leagueId
      );
      if (arrayChangedIndex !== -1) {
        const leagueGuessesWithoutChange = userData.leagues.filter(
          (otherLeagues) => otherLeagues.id !== guess.leagueId
        );
        const leagueGuessesToChange = userData.leagues.find(
          (league) => league.id === guess.leagueId
        );
        if (leagueGuessesToChange) {
          const guessesOfLeagueWithoutChange = leagueGuessesToChange.guesses.filter(
            (otherGuesses) => otherGuesses.MatchNumber !== guess.guess.MatchNumber
          );
          await ctx.db.patch(userId, {
            leagues: [
              ...leagueGuessesWithoutChange,
              {
                id: leagueGuessesToChange.id,
                guesses: [...guessesOfLeagueWithoutChange, guess.guess],
                totalPoints: leagueGuessesToChange.totalPoints,
              },
            ],
          });
        }
      }
    }
  },
});

export const listLeagues = query({
  args: {},
  handler: async (ctx) => {
    const leagues = await ctx.db.query('leagues').collect();
    return leagues;
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    return users;
  },
});
