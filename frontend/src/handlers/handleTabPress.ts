import { editorStore } from "../App";
import { currentLineTextAtom } from "../atoms/currentLineTextAtom";
import { cursorPositionAtom } from "../atoms/cursorPositionAtom";
import { refocusInput } from "../utils/refocusInput";

interface Props {
  shiftKey: boolean;
}

export function handleTabPress({ shiftKey }: Props) {
  const selectionStart = editorStore.get(cursorPositionAtom);

  editorStore.set(currentLineTextAtom, (prev) => {
    let next = prev;
    const key = "\t";
    const isList = prev.match(/^[\t ]*(?=-\s)/);
    if (selectionStart !== 0 && !isList && !shiftKey) {
      next = prev.slice(0, selectionStart) + key + prev.slice(selectionStart);
    } else if (!shiftKey) {
      next = key + prev;
    } else if (prev.match(/^\s+/) && shiftKey) {
      next = prev.slice(1);
    }
    return next;
  });
  refocusInput(selectionStart + 1);
}
