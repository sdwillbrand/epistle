import { KeyboardEvent } from "react";
import { editorStore } from "@/App";
import { currentLineIndexAtom } from "@/atoms/currentLineIndexAtom";
import { currentLineTextAtom, editorLinesAtom } from "@/atoms/filesAtom";
import {
  openVerseSuggestionAtom,
  verseSuggestionIndexAtom,
} from "@/atoms/verseSuggestionAtom";

export function handleArrowDownPress(event: KeyboardEvent, dir: -1 | 1) {
  event.preventDefault();
  const openVerseSuggestion = editorStore.get(openVerseSuggestionAtom);
  if (!openVerseSuggestion) {
    moveToNextLine(dir);
  } else {
    navigateVerseSuggestions();
  }
}

// Handles moving to the next line
function moveToNextLine(dir: -1 | 1) {
  const lines = editorStore.get(editorLinesAtom);
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  const currentLineText = editorStore.get(currentLineTextAtom);
  if (currentLineIndex + dir < lines.length && currentLineIndex + dir >= 0) {
    editorStore.set(currentLineIndexAtom, (prevIndex) => {
      const nextLineIndex = prevIndex + dir;
      const nextLineText = lines[nextLineIndex];

      editorStore.set(currentLineTextAtom, nextLineText);

      editorStore.set(editorLinesAtom, (lines) => {
        const updatedLines = [...lines];
        updatedLines[currentLineIndex] = currentLineText;
        return updatedLines;
      });

      return nextLineIndex;
    });
  }
}

// Navigates through verse suggestions
function navigateVerseSuggestions() {
  editorStore.set(verseSuggestionIndexAtom, (prevIndex) =>
    prevIndex === undefined ? 0 : prevIndex + 1
  );
}
