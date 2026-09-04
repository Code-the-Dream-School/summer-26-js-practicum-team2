const DELETION_GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

const getScheduledDeletionFields = ({
  approvedBy = null,
  deletionRequestedAt = null,
  now = new Date(),
} = {}) => {
  const deletedAt = new Date(now);

  return {
    is_deleted: true,
    is_archived: false,
    deleted_at: deletedAt,
    deletion_scheduled_at: new Date(deletedAt.getTime() + DELETION_GRACE_PERIOD_MS),
    deletion_status: "approved",
    deletion_requested_at: deletionRequestedAt || deletedAt,
    deletion_approved_by: approvedBy,
  };
};

const scheduleAccountDeletion = (user, options = {}) => {
  Object.assign(
    user,
    getScheduledDeletionFields({
      ...options,
      deletionRequestedAt: user.deletion_requested_at,
    }),
  );
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
  getScheduledDeletionFields,
  scheduleAccountDeletion,
  isWithinReactivationGracePeriod,
  reactivateAccount,
};
