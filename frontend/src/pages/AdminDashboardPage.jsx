import { useEffect, useState } from "react";
import { getAdminUsers } from "../services/api";
import Card from "../shared/Card/Card.component";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [state, setState] = useState({ isLoading: true, error: "" });

  useEffect(() => {
    let isCurrent = true;
    getAdminUsers()
      .then((payload) => {
        if (isCurrent) {
          setUsers(payload.users ?? []);
          setState({ isLoading: false, error: "" });
        }
      })
      .catch((error) => {
        if (isCurrent) setState({ isLoading: false, error: error.message });
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="text-small font-semibold uppercase tracking-wide text-primary">Admin</p>
        <h1 className="font-heading text-h1 font-bold text-heading">Control center</h1>
        <p className="max-w-2xl text-foreground">
          Manage access and monitor the people using Sprout.
        </p>
      </header>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-primary/10 px-5 py-4">
          <h2 className="font-heading text-h3 font-bold text-heading">Users</h2>
          <span className="text-sm text-foreground">{users.length} loaded</span>
        </div>
        {state.isLoading ? <p className="p-5 text-foreground">Loading users...</p> : null}
        {state.error ? (
          <p role="alert" className="p-5 text-danger">
            {state.error}
          </p>
        ) : null}
        {!state.isLoading && !state.error ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-primary/5 text-heading">
                <tr>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-primary/10">
                    <td className="px-5 py-4 font-medium text-heading">{user.name}</td>
                    <td className="px-5 py-4 text-foreground">{user.email}</td>
                    <td className="px-5 py-4 capitalize text-foreground">{user.role}</td>
                    <td className="px-5 py-4 text-foreground">
                      {user.deleted_at ? "Deleted" : user.is_disabled ? "Disabled" : "Active"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </main>
  );
}
