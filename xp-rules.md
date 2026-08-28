# XP, Streak, and Progression Rules

## Purpose

This document serves as the source of truth for learner XP, streaks, learning day statistics, and lesson progression rules.

---

# XP Rules

## Daily XP Cap

Learners may earn a maximum of **500 XP per day**.

- XP cannot exceed the daily cap.
- Partial XP awards are allowed if only part of an award fits within the remaining cap.

### Example

Current XP Today: 490

Incoming Award: +20 XP

Result:

- Awarded XP = 10
- Daily Total = 500
- Remaining XP = 0

---

## Lesson Completion XP

**Event:** `lesson_complete`

**Reward:** +20 XP

### Conditions

- XP is awarded only the first time a lesson is completed.
- Repeating a lesson does not grant additional XP.

### Example

First completion:

- Award: +20 XP

Repeat completion:

- Award: +0 XP

---

## Quiz Pass XP

**Event:** `quiz_pass`

**Reward:** +10 XP

### Conditions

- Quiz score must be at least 70%.
- XP is awarded only on the learner's first successful pass.

### Example

85% score on first passing attempt:

- Award: +10 XP

Passing again later:

- Award: +0 XP

---

## Perfect Quiz XP

**Event:** `quiz_perfect`

**Reward:** +5 XP

### Conditions

- Quiz score must equal 100%.
- XP is only awarded the first time a learner achieves a perfect score on a specific quiz.

### Example

First perfect score on Quiz A:

- Award: +5 XP

Second perfect score on Quiz A:

- Award: +0 XP

First perfect score on Quiz B:

- Award: +5 XP

---

# Learning Day Rules

## Learning Days

A learning day represents a unique calendar day on which the learner completed at least one learning activity.

Multiple activities completed on the same day count as a single learning day.

Learning days are calculated using the learner's configured timezone.

### Example

Activity timestamps:

```text
2026-08-20 09:00
2026-08-20 18:30
2026-08-21 14:00
```

Result:

```text
Learning Days = 2
```

because activity occurred on:

```text
2026-08-20
2026-08-21
```

### Purpose

This metric measures long-term learning consistency regardless of streak interruptions.

---

# Streak Rules

## Streak Definition

A streak represents consecutive calendar days on which the learner was active.

Streak calculations are based on the learner's configured timezone.

---

## Current Streak

The current streak is the number of consecutive active days ending:

- Today, or
- Yesterday

If the learner misses an entire day, the current streak resets to 0.

### Example

Active Days:

```text
Aug 22
Aug 23
Aug 24
```

Current Date:

```text
Aug 24
```

Result:

```text
Current Streak = 3
```

---

### Example: Streak Reset

Active Days:

```text
Aug 22
Aug 23
Aug 24
```

Current Date:

```text
Aug 27
```

Result:

```text
Current Streak = 0
```

because a learning day was missed.

---

## Longest Streak

The longest streak is the largest run of consecutive active days in the learner's history.

### Example

Active Days:

```text
Aug 1
Aug 2
Aug 3
Aug 7
Aug 8
```

Result:

```text
Current Streak = 2
Longest Streak = 3
```

---

# Timezone Handling

All streak and learning-day calculations use the learner's configured timezone.

Activity timestamps are normalized into local calendar day keys using the format:

```text
YYYY-MM-DD
```

### Example

Timestamp:

```text
2026-08-25T03:00:00Z
```

Timezone:

```text
America/New_York
```

Local Date Key:

```text
2026-08-24
```

---

# Lesson Progression Rules

## Lesson Unlocking

Lessons unlock sequentially.

A learner may access a lesson if:

1. It is the first lesson in the sequence.
2. The immediately preceding lesson has been completed.

### Example

Sequence:

```text
1.1 → 1.2 → 1.3
```

Completed Lessons:

```text
1.1
```

Result:

```text
1.2 = Unlocked
1.3 = Locked
```

---

## First Lesson Rule

The first lesson in a sequence is always unlocked.

### Example

Sequence:

```text
1.1 → 1.2 → 1.3
```

Lesson:

```text
1.1
```

Result:

```text
Unlocked
```