import { useEffect, KeyboardEvent } from "react";
import { useDebounce } from "use-debounce";
import { useLineEditor } from "../hooks/useLineEditor";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import classNames from "classnames";
import {
  openVerseSuggestionAtom,
  suggestionAtom,
  verseSuggestionIndexAtom,
} from "../atoms/verseSuggestionAtom";
import { LineDisplay } from "./LineDisplay";
import { VerseSuggestion } from "./VerseSearch";
import { editorLinesAtom } from "../atoms/editorLinesAtom";
import { currentLineTextAtom } from "../atoms/currentLineTextAtom";
import { currentLineIndexAtom } from "../atoms/currentLineIndexAtom";
import { handleEnterPress } from "../handlers/handleEnterPress";
import { handleBackspacePress } from "../handlers/handleBackspacePress";
import { handleKeyPress } from "../handlers/handleKeyPress";
import { handleArrowDownPress } from "../handlers/handleArrowDownPress";
import { handleArrowUpPress } from "../handlers/handleArrowUpPress";
import { handleArrowLeftPress } from "../handlers/handleArrowLeftPress";
import { handleArrowRightPress } from "../handlers/handleArrowRightPress";
import { cursorPositionAtom } from "../atoms/cursorPositionAtom";
import { useEventListener } from "usehooks-ts";
import { handleTabPress } from "../handlers/handleTabPress";
import { handleCopy } from "../handlers/handleCopy";
import { handleCut } from "../handlers/handleCut";
import { handlePaste } from "../handlers/handlePaste";

export const Editor = () => {
  const {
    ref: inputRef,
    getCaretIndexAtPosition,
    measureText,
  } = useLineEditor();
  const openVerseSuggestion = useAtomValue(openVerseSuggestionAtom);
  const [suggestionIndex, setVerseSuggestionIndex] = useAtom(
    verseSuggestionIndexAtom
  );
  const [lines, setLines] = useAtom(editorLinesAtom);
  const [currentLineText, setCurrentLineText] = useAtom(currentLineTextAtom);
  const [currentLineIndex, setCurrentLineIndex] = useAtom(currentLineIndexAtom);
  const setCursorPosition = useSetAtom(cursorPositionAtom);
  const [suggestion, setSuggestion] = useAtom(suggestionAtom);
  const [debouncedValue] = useDebounce(currentLineText, 200);

  useEffect(() => {
    const result = debouncedValue.match(/\(([^)]+)\)$/); // Match the slash followed by non-whitespace characters
    if (!result) {
      setSuggestion("");
    } else {
      setSuggestion(result[0].slice(1, -1)); // Extract the suggestion by removing the parenthesis
    }
  }, [debouncedValue]);

  useEventListener(
    "keydown",
    (event) => {
      const { selectionStart } = event.target as HTMLTextAreaElement;
      setCursorPosition(selectionStart);
    },
    inputRef
  );

  const handleKeys = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!inputRef.current) return;
    const key = event.key;
    const { selectionStart, selectionEnd } = inputRef.current;
    if (key === "Enter") {
      handleEnterPress();
    } else if (key === "Backspace") {
      handleBackspacePress({ metaKey: event.metaKey, altKey: event.altKey });
    } else if (key === "ArrowDown") {
      handleArrowDownPress(event);
    } else if (key === "ArrowUp") {
      handleArrowUpPress(event);
    } else if (key === "ArrowLeft") {
      handleArrowLeftPress();
    } else if (key === "ArrowRight") {
      handleArrowRightPress();
    } else if (key === "Tab") {
      event.preventDefault();
      handleTabPress({ shiftKey: event.shiftKey });
    } else if (key === "c" && event.metaKey) {
      await handleCopy(selectionStart, selectionEnd);
    } else if (key === "x" && event.metaKey) {
      await handleCut(selectionStart, selectionEnd);
    } else if (key === "v" && event.metaKey) {
      await handlePaste();
    } else if (key.length === 1) {
      handleKeyPress({ key, metaKey: event.metaKey });
    }
    // else if (
    //   key === "z" &&
    //   event.metaKey &&
    //   !event.shiftKey &&
    //   currentLineIndex !== null &&
    //   currentStateIndex[currentLineIndex] > 0
    // ) {
    //   const updatedStateIndexes = [...currentStateIndex];
    //   updatedStateIndexes[currentLineIndex] -= 1;

    //   setCurrentStateIndex(updatedStateIndexes);
    //   setCurrentLineText(
    //     history[currentLineIndex][updatedStateIndexes[currentLineIndex]]
    //   );

    //   const updatedLines = [...lines];
    //   updatedLines[currentLineIndex] =
    //     history[currentLineIndex][updatedStateIndexes[currentLineIndex]];
    //   setLines(updatedLines);
    // }

    // const updatedLines = [...lines];
    // updatedLines[currentLineIndex] = currentLineText;

    // // Update the history for the current line
    // const updatedHistory = [...history];
    // const newHistory = updatedHistory[currentLineIndex].slice(
    //   0,
    //   currentStateIndex[currentLineIndex] + 1
    // );
    // newHistory.push(currentLineText);
    // updatedHistory[currentLineIndex] = newHistory;

    // // Update the state index for the current line
    // const updatedStateIndexes = [...currentStateIndex];
    // updatedStateIndexes[currentLineIndex] = newHistory.length - 1;

    // setLines(updatedLines);
    // setHistory(updatedHistory);
    // setCurrentStateIndex(updatedStateIndexes);
  };

  return (
    <div className="h-full outline-transparent relative mt-5">
      {lines.map((line, i) => (
        <div
          className={classNames("absolute w-full flex", {
            hidden: i === currentLineIndex,
          })}
          key={i}
          style={{ top: `${i * 20}px`, minHeight: "20px" }}
          onClick={(e) => {
            setLines((prev) => {
              const result = [...prev];
              result[currentLineIndex] = currentLineText;
              return result;
            });
            setCurrentLineIndex(i);
            setCurrentLineText(lines[i]);
            setTimeout(() => {
              inputRef.current?.focus();
            }, 1);
            const mouseX = e.clientX;
            // Optimized text width measurement using canvas

            setTimeout(() => {
              if (inputRef.current) {
                const input = inputRef.current;

                // Focus the input
                input.focus();

                // Calculate the mouse position relative to the input element
                const { left } = input.getBoundingClientRect();
                const relativeX = mouseX - left;

                // Find the character index at the mouse position
                const position = getCaretIndexAtPosition(relativeX);

                // Set the caret position
                input.setSelectionRange(position, position);
              }
            }, 1);
          }}
        >
          <LineDisplay line={line} />
        </div>
      ))}
      <textarea
        ref={inputRef}
        onKeyDown={handleKeys}
        className="bg-black text-white outline-none resize-none overflow-hidden z-10 absolute w-full shadow-sm caret-amber-500 text-base"
        style={{ top: `${currentLineIndex * 20}px`, height: "24px" }}
        value={currentLineText}
      />
      <VerseSuggestion
        hidden={!openVerseSuggestion}
        input={suggestion}
        selectedIndex={suggestionIndex}
        style={{
          top: `${(currentLineIndex + 1) * 20}px`,
          left: `${measureText(
            currentLineText.slice(0, inputRef.current?.selectionStart ?? 0)
          )}px`,
        }}
      />
    </div>
  );
};
