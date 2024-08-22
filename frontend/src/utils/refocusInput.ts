import { editorStore } from "../App";
import { inputRefAtom } from "../atoms/inputRefAtom";

export const refocusInput = (pos: number) => {
  const inputRef = editorStore.get(inputRefAtom);
  if (!inputRef) return;
  setTimeout(() => {
    inputRef.focus();
    inputRef.setSelectionRange(pos, pos); // Reset the selection range
  }, 0);
};
