import { KeyboardEvent } from "react";
import { editorStore } from "../App";
import { currentLineIndexAtom } from "../atoms/currentLineIndexAtom";
import { currentLineTextAtom } from "../atoms/currentLineTextAtom";
import { editorLinesAtom } from "../atoms/editorLinesAtom";
import {
  openVerseSuggestionAtom,
  verseSuggestionIndexAtom,
} from "../atoms/verseSuggestionAtom";

export const handleArrowUpPress = (event: KeyboardEvent) => {
  event.preventDefault();

  const openVerseSuggestion = editorStore.get(openVerseSuggestionAtom);
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  const currentLineText = editorStore.get(currentLineTextAtom);
  const lines = editorStore.get(editorLinesAtom);

  if (!openVerseSuggestion) {
    handleArrowUpNavigation(currentLineIndex, currentLineText, lines);
  } else {
    navigateVerseSuggestion();
  }
};

// Handles normal navigation for ArrowUp when verse suggestions are not open
function handleArrowUpNavigation(
  currentLineIndex: number,
  currentLineText: string,
  lines: string[]
) {
  if (currentLineIndex > 0) {
    editorStore.set(currentLineIndexAtom, (prevIndex) => {
      const nextLineIndex = Math.max(prevIndex - 1, 0);
      updateLineContent(
        nextLineIndex,
        currentLineIndex,
        currentLineText,
        lines
      );
      return nextLineIndex;
    });
  }
}

// Updates the content of the lines when navigating
function updateLineContent(
  nextLineIndex: number,
  currentLineIndex: number,
  currentLineText: string,
  lines: string[]
) {
  editorStore.set(currentLineTextAtom, lines[nextLineIndex]);
  editorStore.set(editorLinesAtom, (prevLines) => {
    const updatedLines = [...prevLines];
    updatedLines[currentLineIndex] = currentLineText; // Save current line text
    return updatedLines;
  });
}

// Handles navigating the verse suggestions when open
function navigateVerseSuggestion() {
  editorStore.set(verseSuggestionIndexAtom, (prevIndex) =>
    prevIndex === undefined ? 0 : Math.max(prevIndex - 1, 0)
  );
}
