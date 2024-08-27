import { editorStore } from "../App";
import { currentLineIndexAtom } from "../atoms/currentLineIndexAtom";
import { currentLineTextAtom } from "../atoms/currentLineTextAtom";
import { cursorPositionAtom } from "../atoms/cursorPositionAtom";
import { editorLinesAtom } from "../atoms/editorLinesAtom";

export function handleArrowRightPress() {
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  const lines = editorStore.get(editorLinesAtom);
  const currentLineText = editorStore.get(currentLineTextAtom);
  const selectionStart = editorStore.get(cursorPositionAtom);
  console.log(
    currentLineIndex,
    lines.length,
    selectionStart,
    currentLineText.length
  );
  if (
    currentLineIndex < lines.length - 1 &&
    selectionStart === currentLineText.length
  ) {
    console.log("HELLO");
    editorStore.set(currentLineIndexAtom, (prev) => {
      const nextLine = prev + 1;
      editorStore.set(currentLineTextAtom, lines[nextLine]);
      editorStore.set(editorLinesAtom, (prev) => {
        const result = [...prev];
        result[currentLineIndex] = currentLineText;
        return result;
      });
      return nextLine;
    });
  }
}
