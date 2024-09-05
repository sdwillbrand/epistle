import { editorStore } from "@/App";
import { currentLineIndexAtom } from "@/atoms/currentLineIndexAtom";
import { currentLineTextAtom, editorLinesAtom } from "@/atoms/filesAtom";
import {
  openVerseSuggestionAtom,
  verseSuggestionIndexAtom,
} from "@/atoms/verseSuggestionAtom";

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
      editorStore.set(currentLineTextAtom, lines[nextLineIndex]);
      return nextLineIndex;
    });
  }
}

// Handles navigating the verse suggestions when open
function navigateVerseSuggestion() {
  editorStore.set(verseSuggestionIndexAtom, (prevIndex) =>
    prevIndex === undefined ? 0 : Math.max(prevIndex - 1, 0)
  );
}
