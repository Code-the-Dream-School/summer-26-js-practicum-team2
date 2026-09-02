const DELETION_GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

const scheduleAccountDeletion = (user, { approvedBy = null, now = new Date() } = {}) => {
  const deletedAt = new Date(now);

  user.is_deleted = true;
  user.is_archived = false;
  user.deleted_at = deletedAt;
  user.deletion_scheduled_at = new Date(deletedAt.getTime() + DELETION_GRACE_PERIOD_MS);
  user.deletion_status = "approved";
  user.deletion_requested_at = user.deletion_requested_at || deletedAt;
  user.deletion_approved_by = approvedBy;
  user.token_version = (user.token_version || 0) + 1;

  return user;
};

const isWithinReactivationGracePeriod = (user, now = Date.now()) => {
  const deletedAt = new Date(user?.deleted_at).getTime();
  return (
    Number.isFinite(deletedAt) && now >= deletedAt && now - deletedAt <= DELETION_GRACE_PERIOD_MS
  );
};

const reactivateAccount = (user) => {
  user.is_deleted = false;
  user.is_archived = false;
  user.deleted_at = null;
  user.deletion_scheduled_at = null;
  user.deletion_status = "none";
  user.deletion_requested_at = null;
  user.deletion_approved_by = null;
  user.token_version = (user.token_version || 0) + 1;

  return user;
};

module.exports = {
  DELETION_GRACE_PERIOD_MS,
  scheduleAccountDeletion,
  isWithinReactivationGracePeriod,
  reactivateAccount,
};
