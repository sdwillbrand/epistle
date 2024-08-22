import { editorStore } from "../App";
import { currentLineIndexAtom } from "../atoms/currentLineIndexAtom";
import { currentLineTextAtom } from "../atoms/currentLineTextAtom";
import { editorLinesAtom } from "../atoms/editorLinesAtom";
import { inputRefAtom } from "../atoms/inputRefAtom";
import { openVerseSuggestionAtom } from "../atoms/verseSuggestionAtom";
import { refocusInput } from "../utils/refocusInput";

interface KeyPressProps {
  key: string;
  metaKey: boolean;
}

export function handleKeyPress({ key, metaKey }: KeyPressProps) {
  if (key.length === 1 && !metaKey) {
    insertCharacterAtCaret(key);

    if (key === "(") {
      handleOpenParenthesis();
    }
    const inputRef = editorStore.get(inputRefAtom);
    if (!inputRef) return;
    const selectionStart = inputRef.selectionStart;
    refocusInput(selectionStart + 1);
  }
}

// Inserts a character at the current caret position
function insertCharacterAtCaret(character: string) {
  const inputRef = editorStore.get(inputRefAtom);
  if (!inputRef) return;
  const selectionStart = inputRef.selectionStart;
  editorStore.set(currentLineTextAtom, (prevText) => {
    const beforeCursor = prevText.slice(0, selectionStart);
    const afterCursor = prevText.slice(selectionStart);
    return beforeCursor + character + afterCursor;
  });
}

// Handles the case when the "(" key is pressed
function handleOpenParenthesis() {
  const inputRef = editorStore.get(inputRefAtom);
  if (!inputRef) return;
  const selectionStart = inputRef.selectionStart;
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  editorStore.set(openVerseSuggestionAtom, true);

  editorStore.set(currentLineTextAtom, (prevText) => {
    const beforeCursor = prevText.slice(0, selectionStart + 1);
    const afterCursor = prevText.slice(selectionStart + 1);

    const updatedText = beforeCursor + ")" + afterCursor;

    editorStore.set(editorLinesAtom, (prevLines) =>
      updateLineInArray(prevLines, currentLineIndex, updatedText)
    );

    return updatedText;
  });
}

// Updates a specific line in the lines array
function updateLineInArray(
  lines: string[],
  index: number,
  newText: string
): string[] {
  const updatedLines = [...lines];
  updatedLines[index] = newText;
  return updatedLines;
}
