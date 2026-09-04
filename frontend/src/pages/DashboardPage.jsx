import { Link } from "react-router";
import { useAuthContext } from "../context/AuthContext";
import DashboardHero from "../features/dashboard/DashboardHero/DashboardHero.component";
import LeaderboardCard from "../features/dashboard/LeaderboardCard/LeaderboardCard.component";
import RecentActivityCard from "../features/dashboard/RecentActivityCard/RecentActivityCard.component";
import UnitProgressRow from "../features/dashboard/UnitProgressRow/UnitProgressRow.component";
import Button from "../shared/Button/Button.component";
import Card from "../shared/Card/Card.component";
import EmptyState from "../shared/EmptyState/EmptyState.component";
import Skeleton from "../shared/Skeleton/Skeleton.component";
import { ROUTES } from "../app/router/routes";

import useDashboardData from "../hooks/useDashboardData";
import useLeaderboardData from "../hooks/useLeaderboardData";

function LeaderboardPanel({ leaderboard, isLoading, error, refresh }) {
  if (isLoading && !leaderboard) {
    return <Skeleton className="h-64 rounded-2xl border border-neutral-200 bg-surface-raised" />;
  }

  if (error && !leaderboard) {
    return (
      <Card className="space-y-3">
        <h2 className="font-heading text-h4 font-bold text-heading">Weekly leaderboard</h2>
        <p className="text-small text-neutral-600">{error}</p>
        <Button type="button" onClick={() => void refresh()}>
          Try leaderboard again
        </Button>
      </Card>
    );
  }

  return <LeaderboardCard leaderboard={leaderboard} />;
}

function DashboardSkeleton() {
  return (
    <section className="space-y-6" aria-hidden="true">
      <Skeleton className="h-56 rounded-2xl border border-neutral-200 bg-surface-raised" />
      <Skeleton className="h-36 rounded-2xl border border-neutral-200 bg-surface-raised" />
      <div className="space-y-3">
        <Skeleton className="h-20 rounded-2xl border border-neutral-200 bg-surface-raised" />
        <Skeleton className="h-20 rounded-2xl border border-neutral-200 bg-surface-raised" />
        <Skeleton className="h-20 rounded-2xl border border-neutral-200 bg-surface-raised" />
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthContext();
  const { dashboard, isLoading, error } = useDashboardData({
    userId: user?.id,
    isAuthenticated,
  });
  const leaderboardState = useLeaderboardData({ userId: user?.id, isAuthenticated });

  if (isLoading && !dashboard) {
    return <DashboardSkeleton />;
  }

  if (error && !dashboard) {
    return (
      <EmptyState
        icon="⚠️"
        title="We could not load your dashboard"
        message={error}
        action={
          <Button as={Link} to={ROUTES.HOME} variant="primary" className="px-5 py-2.5">
            Back to home
          </Button>
        }
      />
    );
  }

  const { hero, progress, nextAction, units = [], recentActivity = [] } = dashboard || {};
  if (units.length === 0) {
    return (
      <section className="space-y-6">
        <DashboardHero hero={hero} nextAction={nextAction} overallProgress={progress} />
        <LeaderboardPanel {...leaderboardState} />
        <EmptyState
          icon="🌱"
          title="Content coming soon"
          message="New lessons are being prepared. Check back soon for something new to explore."
          action={
            <Button as={Link} to={ROUTES.LEARN} variant="primary" className="px-5 py-2.5">
              View learning path
            </Button>
          }
        />
      </section>
    );
  }
  const completedLessons = units.reduce((sum, unit) => sum + unit.completedLessons, 0);
  const hasNoProgress = completedLessons === 0;

  return (
    <section className="space-y-6">
      <DashboardHero hero={hero} nextAction={nextAction} overallProgress={progress} />
      <LeaderboardPanel {...leaderboardState} />

      {hasNoProgress ? (
        <EmptyState
          icon="🌱"
          title="Welcome to your progress dashboard"
          message="Ready to start? Begin with Budgeting Basics"
          action={
            <Button
              as={Link}
              to={nextAction?.href || "/learn/cashFlow/1.1"}
              variant="primary"
              className="px-5 py-2.5"
            >
              Begin with Budgeting Basics
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <header className="space-y-1">
            <h2 className="font-heading text-h4 font-bold text-heading">Unit progress</h2>
            <p className="text-small text-neutral-600">{completedLessons} lessons completed</p>
          </header>

          <div className="space-y-3">
            {units.map((unit) => (
              <UnitProgressRow key={unit.id} unit={unit} />
            ))}
          </div>

          <RecentActivityCard activity={recentActivity} />
        </div>
      )}
    </section>
  );
}
