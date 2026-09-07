import { useCallback, useState } from "react";
import { createRewardToasts } from "../utils/rewardToasts";

export default function useRewardQueue() {
  const [rewardToastQueue, setRewardToastQueue] = useState([]);

  const addRewards = useCallback((rewards) => {
    const newToasts = createRewardToasts(rewards);

    setRewardToastQueue((current) => [...current, ...newToasts]);
  }, []);

  function closeToast() {
    setRewardToastQueue((current) => current.slice(1));
  }

  return {
    hasToasts: rewardToastQueue.length > 0,
    currentToast: rewardToastQueue[0],
    addRewards,
    closeToast,
  };
}
