import { editorStore } from "../App";
import { currentLineIndexAtom } from "../atoms/currentLineIndexAtom";
import { currentLineTextAtom } from "../atoms/currentLineTextAtom";
import { cursorPositionAtom } from "../atoms/cursorPositionAtom";
import { editorLinesAtom } from "../atoms/editorLinesAtom";
import { refocusInput } from "../utils/refocusInput";

export function handleArrowLeftPress() {
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  const selectionStart = editorStore.get(cursorPositionAtom);

  if (currentLineIndex > 0 && selectionStart === 0) {
    editorStore.set(currentLineIndexAtom, (prev) => {
      const nextLine = Math.max(prev - 1, 0);
      const lines = editorStore.get(editorLinesAtom);
      editorStore.set(currentLineTextAtom, lines[nextLine]);
      return nextLine;
    });
    refocusInput(-1);
  }
}
