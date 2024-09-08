import { editorStore } from "@/App";
import { currentLineIndexAtom } from "@/atoms/currentLineIndexAtom";
import { currentLineTextAtom, editorLinesAtom } from "@/atoms/filesAtom";
import { inputRefAtom } from "@/atoms/inputRefAtom";
import {
  openVerseSuggestionAtom,
  suggestionAtom,
} from "@/atoms/verseSuggestionAtom";
import { getIndentLevel } from "@/utils/getIndentLevel";
import { refocusInput } from "@/utils/refocusInput";

export const handleEnterPress = () => {
  const openVerseSuggestion = editorStore.get(openVerseSuggestionAtom);
  const currentLineText = editorStore.get(currentLineTextAtom);
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  const inputRef = editorStore.get(inputRefAtom);

  if (!inputRef) return;

  const selectionStart = inputRef.selectionStart;

  if (!openVerseSuggestion) {
    handleNewLineInsertion(selectionStart, currentLineText, currentLineIndex);
  } else {
    closeVerseSuggestion();
  }
};

// Handles inserting a new line depending on the cursor position
function handleNewLineInsertion(
  selectionStart: number,
  currentLineText: string,
  currentLineIndex: number
) {
  let nextLineText = "";

  editorStore.set(editorLinesAtom, (prevLines: string[]) => {
    let updatedLines = [...prevLines]; // Copy previous lines
    if (isAtStartOfFirstLine(selectionStart, currentLineText)) {
      // Case 1: At the beginning of the first line, insert a new line above
      updatedLines.unshift(""); // Add an empty line at the beginning
      nextLineText = currentLineText;
    } else if (isCursorInMiddleOfLine(selectionStart)) {
      // Case 2: Cursor is in the middle of a line, split the current line
      updatedLines = splitLineAtCursor(
        updatedLines,
        selectionStart,
        currentLineText,
        currentLineIndex
      );
      nextLineText = currentLineText.slice(selectionStart); // Text after the cursor
    } else {
      // Case 3: At the start of a non-first line, insert a new line below
      updatedLines.splice(currentLineIndex + 1, 0, ""); // Insert empty line at the current index
    }
    console.log({ nextLineText });
    return updatedLines;
  });
  editorStore.set(currentLineIndexAtom, (prev) => prev + 1);
  const position = adjustCurrentLineText(nextLineText, currentLineText);
  refocusInput(position);
}

// Checks if the cursor is at the start of the first line
function isAtStartOfFirstLine(
  selectionStart: number,
  currentLineText: string
): boolean {
  return selectionStart === 0 && currentLineText !== "";
}

// Checks if the cursor is in the middle of a line
function isCursorInMiddleOfLine(selectionStart: number): boolean {
  return selectionStart !== 0;
}

// Splits the current line at the cursor position
function splitLineAtCursor(
  lines: string[],
  selectionStart: number,
  currentLineText: string,
  currentLineIndex: number
): string[] {
  const beforeCursor = currentLineText.slice(0, selectionStart);
  const afterCursor = currentLineText.slice(selectionStart);

  lines[currentLineIndex] = beforeCursor; // Update current line with text before the cursor
  lines.splice(currentLineIndex + 1, 0, afterCursor); // Insert new line with text after the cursor

  return lines;
}

// Adjusts the indentation and list formatting of the new line
function adjustCurrentLineText(nextLineText: string, currentLineText: string) {
  let indentLevel = getIndentLevel(currentLineText);
  const isList = currentLineText.match(/\s*(?=-\s*\w)/);

  editorStore.set(
    currentLineTextAtom,
    "\t".repeat(indentLevel) + (isList ? "- " : "") + nextLineText
  );
  return -1;
}

// Closes the verse suggestion box
function closeVerseSuggestion() {
  editorStore.set(suggestionAtom, "");
  editorStore.set(openVerseSuggestionAtom, false);
}
