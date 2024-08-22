import { KeyboardEvent } from "react";
import { editorStore } from "../App";
import {
  openVerseSuggestionAtom,
  verseSuggestionIndexAtom,
} from "../atoms/verseSuggestionAtom";
import { editorLinesAtom } from "../atoms/editorLinesAtom";
import { currentLineIndexAtom } from "../atoms/currentLineIndexAtom";
import { currentLineTextAtom } from "../atoms/currentLineTextAtom";

export function handleArrowDownPress(event: KeyboardEvent) {
  event.preventDefault();
  const openVerseSuggestion = editorStore.get(openVerseSuggestionAtom);
  if (!openVerseSuggestion) {
    moveToNextLine();
  } else {
    navigateVerseSuggestions();
  }
}

// Handles moving to the next line
function moveToNextLine() {
  const lines = editorStore.get(editorLinesAtom);
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  const currentLineText = editorStore.get(currentLineTextAtom);
  if (currentLineIndex + 1 < lines.length) {
    editorStore.set(currentLineIndexAtom, (prevIndex) => {
      const nextLineIndex = prevIndex + 1;
      const nextLineText = lines[nextLineIndex];

      editorStore.set(currentLineTextAtom, nextLineText);

      editorStore.set(editorLinesAtom, (prevLines) =>
        updateCurrentLine(prevLines, currentLineText)
      );

      return nextLineIndex;
    });
  }
}

// Updates the current line in the lines array
function updateCurrentLine(lines: string[], updatedText: string): string[] {
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  const updatedLines = [...lines];
  updatedLines[currentLineIndex] = updatedText;
  return updatedLines;
}

// Navigates through verse suggestions
function navigateVerseSuggestions() {
  editorStore.set(verseSuggestionIndexAtom, (prevIndex) =>
    prevIndex === undefined ? 0 : prevIndex + 1
  );
}
