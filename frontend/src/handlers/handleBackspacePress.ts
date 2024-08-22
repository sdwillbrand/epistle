import { editorStore } from "../App";
import { currentLineIndexAtom } from "../atoms/currentLineIndexAtom";
import { currentLineTextAtom } from "../atoms/currentLineTextAtom";
import { editorLinesAtom } from "../atoms/editorLinesAtom";
import { inputRefAtom } from "../atoms/inputRefAtom";
import { refocusInput } from "../utils/refocusInput";

interface BackspaceProps {
  metaKey: boolean;
  altKey: boolean;
}

export function handleBackspacePress({ metaKey, altKey }: BackspaceProps) {
  const currentLineText = editorStore.get(currentLineTextAtom);
  if (!currentLineText) {
    handleEmptyLineBackspace();
  } else if (!metaKey && !altKey) {
    handleRegularBackspace();
  } else if (metaKey) {
    handleMetaKeyBackspace();
  } else if (altKey) {
    handleAltKeyBackspace();
  }
}

// Backspace on an empty line
function handleEmptyLineBackspace() {
  console.log("EMPTYLINE");
  const lines = editorStore.get(editorLinesAtom);
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  editorStore.set(currentLineIndexAtom, (prevIndex) => {
    const newIndex = Math.max(prevIndex - 1, 0);
    console.log({ lines, newIndex });
    editorStore.set(currentLineTextAtom, lines[newIndex]);

    if (currentLineIndex > 0) {
      editorStore.set(editorLinesAtom, (prevLines) =>
        removeLineAtIndex(prevLines, currentLineIndex)
      );
    }

    return newIndex;
  });
}

// Regular backspace, deleting a character
function handleRegularBackspace() {
  const inputRef = editorStore.get(inputRefAtom);
  if (!inputRef) return;
  const selectionStart = inputRef.selectionStart;
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  if (selectionStart === 0 && currentLineIndex > 0) {
    handleLineMerge();
  } else {
    editorStore.set(
      currentLineTextAtom,
      (prevText) =>
        prevText.slice(0, selectionStart - 1) + prevText.slice(selectionStart)
    );
    refocusInput(selectionStart - 1);
  }
}

// Backspace with Meta key, clearing the entire line
function handleMetaKeyBackspace() {
  editorStore.set(currentLineTextAtom, "");
}

// Backspace with Alt key, merging the current line with the previous one
function handleAltKeyBackspace() {
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  const inputRef = editorStore.get(inputRefAtom);
  if (!inputRef) return;
  const selectionStart = inputRef.selectionStart;
  if (selectionStart === 0 && currentLineIndex > 0) {
    handleLineMerge();
  }
}

// Helper function to remove a line from an array
function removeLineAtIndex(lines: string[], index: number): string[] {
  const updatedLines = [...lines];
  updatedLines.splice(index, 1);
  return updatedLines;
}

// Merges the current line with the previous one
function handleLineMerge() {
  const inputRef = editorStore.get(inputRefAtom);
  if (!inputRef) return;

  const selectionStart = inputRef.selectionStart;
  const lines = editorStore.get(editorLinesAtom);
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  let newCaretPosition = selectionStart;

  editorStore.set(currentLineIndexAtom, (prevIndex) => {
    const newIndex = Math.max(prevIndex - 1, 0);
    const previousLineText = lines[newIndex];

    editorStore.set(currentLineTextAtom, (currentText) => {
      newCaretPosition = previousLineText.length;
      return previousLineText + currentText;
    });

    if (currentLineIndex > 0) {
      editorStore.set(editorLinesAtom, (prevLines) =>
        removeLineAtIndex(prevLines, currentLineIndex)
      );
    }

    return newIndex;
  });

  refocusInput(newCaretPosition);
}
