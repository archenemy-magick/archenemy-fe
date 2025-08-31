import { persistor, store } from "./configureStore";
import type { RootState, AppDispatch } from "./configureStore";

export { persistor, store };
export default persistor;
export type { RootState, AppDispatch };
