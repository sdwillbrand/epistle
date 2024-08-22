import { editorStore } from "../App";
import { currentLineTextAtom } from "../atoms/currentLineTextAtom";
import { inputRefAtom } from "../atoms/inputRefAtom";

export function getNextToken() {
  const inputRef = editorStore.get(inputRefAtom);
  if (!inputRef) return "";
  const pos = inputRef.selectionStart;
  const currentLineText = editorStore.get(currentLineTextAtom);
  if (pos < currentLineText.length) {
    return currentLineText[pos];
  } else {
    return "";
  }
}
