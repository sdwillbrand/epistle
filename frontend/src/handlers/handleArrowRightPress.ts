import { editorStore } from "@/App";
import { currentLineIndexAtom } from "@/atoms/currentLineIndexAtom";
import { cursorPositionAtom } from "@/atoms/cursorPositionAtom";
import { currentLineTextAtom, editorLinesAtom } from "@/atoms/filesAtom";

export function handleArrowRightPress() {
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  const lines = editorStore.get(editorLinesAtom);
  const currentLineText = editorStore.get(currentLineTextAtom);
  const selectionStart = editorStore.get(cursorPositionAtom);
  if (
    currentLineIndex < lines.length - 1 &&
    selectionStart === currentLineText.length
  ) {
    editorStore.set(currentLineIndexAtom, (prev) => {
      const nextLine = prev + 1;
      editorStore.set(currentLineTextAtom, lines[nextLine]);
      return nextLine;
    });
  }
}
