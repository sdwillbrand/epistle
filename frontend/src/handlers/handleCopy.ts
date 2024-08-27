import { ClipboardSetText } from "../../wailsjs/runtime/runtime";
import { editorStore } from "../App";
import { currentLineTextAtom } from "../atoms/currentLineTextAtom";

export async function handleCopy(from: number, to: number) {
  const currentLineText = editorStore.get(currentLineTextAtom);
  const selectedText = currentLineText.slice(from, to);
  await ClipboardSetText(selectedText);
}
