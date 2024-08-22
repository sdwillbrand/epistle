import {
  openVerseSuggestionAtom,
  suggestionAtom,
  verseSuggestionAtom,
} from "../atoms/verseSuggestionAtom";
import { editorLinesAtom } from "../atoms/editorLinesAtom";
import { editorStore } from "../App";
import { currentLineTextAtom } from "../atoms/currentLineTextAtom";
import { currentLineIndexAtom } from "../atoms/currentLineIndexAtom";
import { inputRefAtom } from "../atoms/inputRefAtom";
import { refocusInput } from "../utils/refocusInput";

export const handleEnterPress = () => {
  const { open: openVerseSuggestion } = editorStore.get(verseSuggestionAtom);
  const currentLineText = editorStore.get(currentLineTextAtom);
  const currentLineIndex = editorStore.get(currentLineIndexAtom);
  const inputRef = editorStore.get(inputRefAtom);
  if (!inputRef) return;
  const selectionStart = inputRef.selectionStart;
  let nextLineText = "";
  if (!openVerseSuggestion) {
    editorStore.set(editorLinesAtom, (prev) => {
      let result = [...prev]; // Copy previous lines

      // Case 1: At the beginning of the first line, insert a new line above
      if (selectionStart === 0 && currentLineText) {
        result.unshift(""); // Add an empty line at the beginning
        nextLineText = currentLineText; // Set next content to the current line's text

        // Case 2: Cursor is not at the start (in the middle of a line), split the current line
      } else if (selectionStart !== 0) {
        const beforeCursor = currentLineText.slice(0, selectionStart); // Text before cursor
        const afterCursor = currentLineText.slice(selectionStart); // Text after cursor

        // Update current line with text before the cursor
        result[currentLineIndex] = beforeCursor;

        // Insert new line with text after the cursor
        result.splice(currentLineIndex + 1, 0, afterCursor);
        nextLineText = afterCursor; // The newly created line's content is now the focus

        // Case 3: At the start of a line that's not the first one, insert a new line above
      } else {
        result.splice(currentLineIndex + 1, 0, ""); // Insert empty line at the current index
      }

      return result;
    });

    let identLevel = 0;
    for (const c of currentLineText) {
      if (c !== "\t") {
        break;
      }
      identLevel++;
    }
    const isList = currentLineText.match(/\s*(?=-\s*\w)/);
    editorStore.set(
      currentLineTextAtom,
      "\t".repeat(identLevel) + (isList ? "- " : "") + nextLineText
    );
    editorStore.set(currentLineIndexAtom, (prev) => prev + 1);

    refocusInput(0);
  } else {
    editorStore.set(suggestionAtom, "");
    editorStore.set(openVerseSuggestionAtom, false);
  }
};
