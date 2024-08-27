import { ClipboardSetText } from "../../wailsjs/runtime/runtime";
import { editorStore } from "../App";
import { currentLineIndexAtom } from "../atoms/currentLineIndexAtom";
import { currentLineTextAtom } from "../atoms/currentLineTextAtom";
import { editorLinesAtom } from "../atoms/editorLinesAtom";

export async function handleCut(from: number, to: number) {
  let selectedText = "";
  const currentLineText = editorStore.get(currentLineTextAtom);
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  const lines = editorStore.get(editorLinesAtom);
  if (from === to) {
    selectedText = currentLineText;
    editorStore.set(currentLineTextAtom, () => {
      const next = currentLineIndex > 0 ? lines[currentLineIndex - 1] : "";
      editorStore.set(editorLinesAtom, (prev) => [
        ...prev.slice(0, currentLineIndex - 1),
        ...prev.slice(currentLineIndex),
      ]);
      editorStore.set(currentLineIndexAtom, (prev) => Math.max(prev - 1, 0));
      return next;
    });
  } else {
    selectedText = currentLineText.slice(from, to);
    editorStore.set(currentLineTextAtom, (prev) => {
      const next = prev.slice(0, from) + prev.slice(to);
      return next;
    });
  }
  await ClipboardSetText(selectedText);
}
