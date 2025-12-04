import { useSyncExternalStore } from "react";

export default function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
