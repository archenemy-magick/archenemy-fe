import { persistor, startPersistence, store } from "./configureStore";
import type { RootState, AppDispatch } from "./configureStore";

export { persistor, startPersistence, store };
export default persistor;
export type { RootState, AppDispatch };
