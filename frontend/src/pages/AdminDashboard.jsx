import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { approveDeleteAccount, rejectDeleteAccount } from "../services/api";
import useAdminDashboardData from "../hooks/useAdminDashboardData";

import Button from "../shared/Button/Button.component";
import Card from "../shared/Card/Card.component";
import EmptyState from "../shared/EmptyState/EmptyState.component";
import Spinner from "../shared/Spinner/Spinner.component";

export default function AdminDashboard() {
  const { csrfToken } = useAuthContext();
  const [activeTab, setActiveTab] = useState("deletions");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const { pendingDeletions, users, isLoading, error, refreshAdminData } = useAdminDashboardData();

  const handleApprove = async (userId) => {
    try {
      setActionLoadingId(userId);
      await approveDeleteAccount({ userId, csrfToken });
      await refreshAdminData();
    } catch (error) {
      alert(`Approval failed. ${error.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };
  const handleReject = async (userId) => {
    try {
      setActionLoadingId(userId);
      await rejectDeleteAccount({ userId, csrfToken });
      await refreshAdminData();
    } catch (err) {
      alert(`Rejection failed: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };
  if (isLoading && pendingDeletions.length === 0 && users.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Loading admin dashboard..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          title="We could not load the admin dashboard"
          message={error}
          action={
            <Button variant="primary" className="px-5 py-2.5" onClick={refreshAdminData}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div>
        <h1 className="font-heading text-h2 font-bold text-heading"> Admin Dashboard</h1>
        <p className="mt-1 text-small text-neutral-600">
          Please select and option to manage your dashboard.
        </p>
      </div>
      {/*Navigate Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 pb-2">
        <Button
          variant={activeTab === "deletions" ? "primary" : "ghost"}
          onClick={() => setActiveTab("deletions")}
        >
          Pending Deletions ({pendingDeletions.length})
        </Button>
        <Button
          variant={activeTab === "users" ? "primary" : "ghost"}
          onClick={() => setActiveTab("users")}
        >
          All Admin Users ({users.length})
        </Button>
      </div>
      <div>
        {/*Tab1: Pending Delete Accounts */}
        {activeTab === "deletions" && (
          <section>
            {pendingDeletions.length === 0 ? (
              <EmptyState
                title="No Pending Requests"
                message="There are currently no user accounts waiting for deletion approval."
              />
            ) : (
              <Card variant="default" className="overflow-x-auto p-0">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-neutral-200 bg-surface-inset text-xs font-semibold uppercase text-neutral-600">
                    <tr>
                      <th className="px-6 py-3">User ID</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {pendingDeletions.map((user) => {
                      const userId = user._id || user.id;
                      const isProcessing = actionLoadingId === userId;
                      return (
                        <tr key={userId} className="hover:bg-surface-inset/50">
                          <td className="px-6 py-4 font-mono text-xs">{userId}</td>
                          <td className="px-6 py-4 font-medium ">{user.email}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="secondary"
                                loading={isProcessing}
                                onClick={() => handleApprove(userId)}
                                className=" !border-danger !text-danger hover:!bg-danger/10"
                              >
                                Approve Deletion
                              </Button>
                              <Button
                                variant="ghost"
                                loading={isProcessing}
                                onClick={() => handleReject(userId)}
                              >
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}
          </section>
        )}
        {/* Tab 2: All Admin Users Directory */}
        {activeTab === "users" && (
          <section>
            {users.length === 0 ? (
              <EmptyState
                title="No Admin Found"
                message="No administrator accounts found in the system."
              />
            ) : (
              <Card variant="default" className="overflow-x-auto p-0">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-neutral-200 bg-surface-inset text-xs font-semibold uppercase text-neutral-600">
                    <tr>
                      <th className="px-6 py-3">User ID</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {users.map((user) => {
                      const userId = user._id || user.id;
                      return (
                        <tr key={userId} className="hover:bg-surface-inset/50">
                          <td className="px-6 py-4 font-mono text-xs">{userId}</td>
                          <td className="px-6 py-4 font-medium ">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                              {user.role}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
