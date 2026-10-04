import { useSyncExternalStore } from "react";
import { persistor } from "~/store";

const subscribe = (onChange: () => void) => persistor.subscribe(onChange);
const isRehydrated = () => persistor.getState().bootstrapped;

/** True once redux-persist has restored saved state. Always false on the server. */
export function usePersistRehydrated(): boolean {
  return useSyncExternalStore(subscribe, isRehydrated, () => false);
}
