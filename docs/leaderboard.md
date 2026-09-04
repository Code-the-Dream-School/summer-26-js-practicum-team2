# Leaderboard rules

The leaderboard week starts every **Monday at 00:00 UTC**. A week is represented as a
half-open interval: `week_start` is included and `week_end` is excluded. For example, the week
starting `2026-09-07T00:00:00.000Z` ends immediately before
`2026-09-14T00:00:00.000Z`.

Weekly totals are materialized in the `weeklyleaderboards` MongoDB collection. Each document
stores one learner's `xp_total` for one `week_start`; a unique index prevents duplicate totals for
the same learner and week. The ranking index sorts totals from highest to lowest, with `user_id`
available as a stable tie-breaker.

The future aggregation and reset jobs must use `getLeaderboardWeek` from
`backend/src/utils/leaderboardTime.js` rather than calculating their own boundaries.

XP awards are recorded in the `xpevents` collection. Each event stores the requested and actually
awarded XP, its UTC day bucket, and its leaderboard week bucket. Weekly totals sum `awarded_xp`,
not `requested_xp`. The `(user_id, source_key)` unique index makes reward sources idempotent, while
the `(user_id, day_start)` index supports enforcing the 500 XP daily cap in UTC.

XP events contain internal identifiers and award data only. They must not contain names, email
addresses, avatars, or other profile information.

This storage contract does not make a learner visible. Leaderboard queries must separately require
`leaderboard_opt_in: true` and must return only display name, avatar, weekly XP, and rank.
