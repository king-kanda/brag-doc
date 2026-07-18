import { useSyncExternalStore } from "react";
import { useAuthStore } from "./store";

export function useAuthHydrated() {
  return useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false
  );
}
