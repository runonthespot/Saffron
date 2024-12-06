import { TypedUseSelectorHook, useSelector } from "react-redux";
import { RootState } from "../store";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Type-safe selector hook
export function useTypedSelector<T>(selector: (state: RootState) => T): T {
  return useAppSelector(selector);
}
