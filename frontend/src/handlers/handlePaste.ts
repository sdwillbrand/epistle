import { ClipboardGetText } from "../../wailsjs/runtime/runtime";
import { editorStore } from "../App";
import { currentLineIndexAtom } from "../atoms/currentLineIndexAtom";
import { currentLineTextAtom } from "../atoms/currentLineTextAtom";
import { cursorPositionAtom } from "../atoms/cursorPositionAtom";
import { editorLinesAtom } from "../atoms/editorLinesAtom";
import { refocusInput } from "../utils/refocusInput";

export async function handlePaste() {
  const copiedText = await ClipboardGetText();
  const selectionStart = editorStore.get(cursorPositionAtom);
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  editorStore.set(currentLineTextAtom, (prev) => {
    let next = "";
    if (selectionStart !== 0) {
      next =
        prev.slice(0, selectionStart) + copiedText + prev.slice(selectionStart);
    } else {
      next = copiedText + prev;
    }
    editorStore.set(editorLinesAtom, (prev) => {
      const result = [...prev];
      result[currentLineIndex] = next;
      return result;
    });
    return next;
  });
  refocusInput(selectionStart + copiedText.length);
}
