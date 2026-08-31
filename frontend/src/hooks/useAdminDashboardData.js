import {useState, useEffect, useCallback, useMemo} from "react";
import { getPendingDeleteAccount, getAdminUsers } from "../services/api";

// Sets default cache Time to Live to 30 seconds.
const ADMIN_CACHE_TTL_MS = 30 * 1000;
const ADMIN_CACHE_KEY = "sprout.admin.dashboard.";

const readCachedAdminData = () => {
  // We use sessionStorage to cache dashboard data for the current browser session.
  const stored = window.sessionStorage.getItem(ADMIN_CACHE_KEY);
  if (!stored) {
    return null;
  }

  try {
    // Cache entries are stored as { payload, expiresAt }.
    const cached = JSON.parse(stored);
    // Return cached data only while it is still fresh.
    return cached.expiresAt > Date.now() ? cached.payload : null;
  } catch {
    // Ignore malformed cache values and treat as a cache miss.
    return null;
  }
};
const cacheAdminData = (payload) => {
  try {
    window.sessionStorage.setItem(
      ADMIN_CACHE_KEY,
      // Expiration is evaluated on read to keep writes simple.
      JSON.stringify({ payload, expiresAt: Date.now() + ADMIN_CACHE_TTL_MS }),
    );
  } catch {
    //unavailable or full session store means default to no-cache
  }
};

export default function useAdminDashboardData() {
  const [adminData, setAdminData] = useState({pendingDeletions: [], users: []});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAdminDashboard= useCallback(
    async ({ force = false } = {}) => {
      if (!force) {
        const cached = readCachedAdminData();
        if (cached) {
          setAdminData(cached);
          setIsLoading(false);
          setError("");
          return cached;
        }   
      }
      setIsLoading(true);
      setError("");
      try {
        const [pendingResp, userResp] = await Promise.all([
          getPendingDeleteAccount(),
          getAdminUsers(),
        ]);
        const payload = {
        pendingDeletions: pendingResp?.users || pendingResp || [],
        users: userResp?.users || userResp || [],
        };
        setAdminData(payload);
        cacheAdminData(payload);
        return payload;
      } catch (error) {
        setError(error.message || "Admin dashboard unable to load right now.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    // Refresh the dashboard when the user's pending deletion updated
    void Promise.resolve().then(fetchAdminDashboard);
  }, [fetchAdminDashboard]);

  const refresh = useCallback(() => {
      window.sessionStorage.removeItem(ADMIN_CACHE_KEY);
      return fetchAdminDashboard({ force: true });
    },[fetchAdminDashboard]);

  return useMemo(
    () => ({
      pendingDeletions: adminData.pendingDeletions,
      users: adminData.users,
      isLoading,
      error,
      refreshAdminData: refresh,
    }),
    [adminData, error, isLoading, refresh],
  );
}
