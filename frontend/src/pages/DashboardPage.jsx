import { Link } from "react-router";
import { useAuthContext } from "../context/AuthContext";
import DashboardHero from "../features/dashboard/DashboardHero/DashboardHero.component";
import RecentActivityCard from "../features/dashboard/RecentActivityCard/RecentActivityCard.component";
import UnitProgressRow from "../features/dashboard/UnitProgressRow/UnitProgressRow.component";
import Button from "../shared/Button/Button.component";
import Card from "../shared/Card/Card.component";
import EmptyState from "../shared/EmptyState/EmptyState.component";
import Skeleton from "../shared/Skeleton/Skeleton.component";
import { ROUTES } from "../app/router/routes";

import useDashboardData from "../hooks/useDashboardData";

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
  //For onbaording xp if user lands on this page once onboarding is complete
  // const { hasToasts, currentToast, addRewards, closeToast } = useRewardQueue();

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

  const { hero, xp, badges, nextAction, units = [], recentActivity = [] } = dashboard || {};

  const completedLessons = units.reduce((sum, unit) => sum + unit.completedLessons, 0);
  const hasNoProgress = completedLessons === 0;

  //For onbaording xp award if user lands on this page once onboarding is complete  
  // //addRewards(response.rewards);

  return (
    <section className="space-y-6">
      <DashboardHero hero={hero} xp={xp?.total ?? 0} badges={badges} />

      <Card className="space-y-3">
        <p className="text-small font-semibold uppercase tracking-wide text-primary">
          Recommended next
        </p>
        <h2 className="font-heading text-h4 font-bold text-heading">{nextAction?.title}</h2>
        <p className="text-neutral-600">{nextAction?.description}</p>
        <Button
          as={Link}
          to={nextAction?.href || "/lessons"}
          variant="primary"
          className="px-5 py-2.5"
        >
          {nextAction?.ctaLabel || "Continue learning"}
        </Button>
      </Card>

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
