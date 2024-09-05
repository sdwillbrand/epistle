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

  useEffect(() => {
    console.log({ currentLineText });
  }, [currentLineText]);

  const handleKeys = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!inputRef.current) return;
    const key = event.key;
    if (key === "Enter") {
      event.preventDefault();
      console.log("ENTER");
      handleEnterPress();
    } else if (key === "Backspace") {
      event.preventDefault();
      handleBackspacePress({ metaKey: event.metaKey, altKey: event.altKey });
    } else if (key === "ArrowDown") {
      handleArrowDownPress(event, 1);
    } else if (key === "ArrowUp") {
      handleArrowDownPress(event, -1);
    } else if (key === "ArrowLeft") {
      handleArrowLeftPress();
    } else if (key === "ArrowRight") {
      handleArrowRightPress();
    } else if (key === "Tab") {
      event.preventDefault();
      handleTabPress({ shiftKey: event.shiftKey });
    }
  };

  const handleLineClick = (lineIndex: number, posX: number) => {
    setLines((prev) => {
      const result = [...prev];
      result[currentLineIndex] = currentLineText;
      return result;
    });
    setCurrentLineIndex(lineIndex);
    setCurrentLineText(lines[lineIndex]);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 1);
    // Optimized text width measurement using canvas

    setTimeout(() => {
      if (inputRef.current) {
        const input = inputRef.current;

        // Focus the input
        input.focus();

        // Calculate the mouse position relative to the input element
        const { left } = input.getBoundingClientRect();
        const relativeX = posX - left;

        // Find the character index at the mouse position
        const position = getCaretIndexAtPosition(relativeX);

        // Set the caret position
        input.setSelectionRange(position, position);
      }
    }, 1);
  };

  return (
    <div className="h-full outline-transparent relative mt-5">
      {lines.map((line, i) => (
        <div
          className={classNames("absolute w-full flex", {
            invisible: i === currentLineIndex,
          })}
          key={i}
          style={{ top: `${i * 20}px`, minHeight: "20px" }}
          contentEditable
          onClick={(e) => handleLineClick(i, e.clientX)}
        >
          <LineDisplay line={line} />
        </div>
      ))}
      <textarea
        ref={inputRef}
        onKeyDown={handleKeys}
        onInput={(e) => setCurrentLineText(e.currentTarget.value)}
        className="bg-black text-white outline-none resize-none overflow-hidden z-10 absolute w-full shadow-sm caret-amber-500 text-base"
        style={{ top: `${currentLineIndex * 20}px`, height: "24px" }}
        value={currentLineText}
        contentEditable
        suppressContentEditableWarning
      />
      {/* <VerseSuggestion
        hidden={!openVerseSuggestion}
        input={suggestion}
        selectedIndex={suggestionIndex}
        style={{
          top: `${(currentLineIndex + 1) * 20}px`,
          left: `${measureText(
            currentLineText.slice(0, inputRef.current?.selectionStart ?? 0)
          )}px`,
        }}
      /> */}
    </div>
  );
};
