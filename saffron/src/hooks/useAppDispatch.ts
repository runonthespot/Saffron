import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";

export const useAppDispatch = () => useDispatch<AppDispatch>();

// Type-safe dispatch hook
export function useTypedDispatch(): AppDispatch {
  return useDispatch<AppDispatch>();
}
