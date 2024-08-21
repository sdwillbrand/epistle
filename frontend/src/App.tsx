import { useState, KeyboardEvent, useRef, useEffect } from "react";
import classNames from "classnames";
import { SaveFile } from "../wailsjs/go/main/App";
import { ClipboardGetText, ClipboardSetText } from "../wailsjs/runtime";
import { VerseSuggestion } from "./components/VerseSearch";
import { useTextWidth } from "./hooks/useTextWidth";
import { useAtomValue, useSetAtom } from "jotai";
import {
  openVerseSuggestionAtom,
  verseSuggestionAtom,
  verseSuggestionIndexAtom,
} from "./atoms";
import { LineDisplay } from "./components/LineDisplay";
import { useDebounce } from "use-debounce";

function App() {
  const [currentLineText, setCurrentLineText] = useState("");
  const [lines, setLines] = useState([""]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const { open: openVerseSuggestion, index: suggestionIndex } =
    useAtomValue(verseSuggestionAtom);
  const setOpenVerseSuggestion = useSetAtom(openVerseSuggestionAtom);
  const setVerseSuggestionIndex = useSetAtom(verseSuggestionIndexAtom);
  const [suggestion, setSuggestion] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const { getCaretIndexAtPosition, measureText } = useTextWidth(inputRef);
  const [history, setHistory] = useState<string[][]>([[]]);
  const [currentStateIndex, setCurrentStateIndex] = useState<number[]>([]); // Pointer to current state for each line
  const [debouncedValue] = useDebounce(currentLineText, 200);

  useEffect(() => {
    const result = debouncedValue.match(/\(([^)]+)\)$/); // Match the slash followed by non-whitespace characters
    if (!result) {
      setSuggestion("");
    } else {
      setSuggestion(result[0].slice(1, -1)); // Extract the suggestion by removing the parenthesis
    }
  }, [debouncedValue]);

  const handleKeys = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!inputRef.current) return;
    const key = event.key;
    const { selectionStart, selectionEnd } = inputRef.current;
    if (key === "Enter") {
      let nextLineText = "";
      if (!openVerseSuggestion) {
        setLines((prev) => {
          let result = [...prev]; // Copy previous lines

          // Case 1: At the beginning of the first line, insert a new line above
          if (selectionStart === 0 && currentLineIndex === 0) {
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
            result.splice(currentLineIndex, 0, ""); // Insert empty line at the current index
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
        setCurrentLineText(
          "\t".repeat(identLevel) + (isList ? "- " : "") + nextLineText
        );
        setCurrentLineIndex((prev) => prev + 1);
      } else {
        setSuggestion("");
        setOpenVerseSuggestion(false);
      }
    } else if (key === "Backspace" && !currentLineText) {
      setCurrentLineIndex((prev) => {
        const nextLine = Math.max(prev - 1, 0);
        setCurrentLineText(lines[nextLine]);
        if (currentLineIndex > 0)
          setLines((prev) => {
            const result = [...prev];
            result.splice(currentLineIndex, 1);
            return result;
          });
        return nextLine;
      });
    } else if (
      key === "Backspace" &&
      currentLineText &&
      !event.metaKey &&
      !event.altKey
    ) {
      if (selectionStart !== 0) {
        setCurrentLineText((prev) => {
          let next =
            prev.slice(0, selectionStart - 1) + prev.slice(selectionStart);
          if (selectionStart === prev.length) {
            next = prev.slice(0, -1);
          }
          return next;
        });
      } else if (currentLineIndex > 0) {
        setCurrentLineIndex((prev) => {
          const nextLine = Math.max(prev - 1, 0);
          setCurrentLineText((prev) => lines[nextLine] + prev);
          if (currentLineIndex > 0)
            setLines((prev) => {
              const result = [...prev];
              result.splice(currentLineIndex, 1);
              return result;
            });
          return nextLine;
        });
      }
      setTimeout(() => {
        inputRef.current!.focus();
        inputRef.current!.setSelectionRange(
          selectionStart - 1,
          selectionStart - 1
        );
      }, 0);
    } else if (key === "Backspace" && event.metaKey) {
      setCurrentLineText("");
    } else if (key === "Backspace" && event.altKey) {
      let startingIndex = -1;
      const isWhitespace = /\s/.test(currentLineText[selectionStart - 1]);
      for (let i = selectionStart - 1; i > 0; i--) {
        if (
          (!/\s/.test(currentLineText[i]) && isWhitespace) ||
          (/\s/.test(currentLineText[i]) && !isWhitespace)
        ) {
          console.log({
            c: currentLineText[i],
            isWhitespace,
            i: currentLineText[selectionStart],
          });
          startingIndex = i;
          break;
        }
      }
      console.log({ startingIndex });
      if (startingIndex === -1) {
        setCurrentLineText("");
      } else {
        setCurrentLineText(
          (prev) =>
            prev.slice(0, startingIndex + 1) + prev.slice(selectionStart)
        );
      }
      setTimeout(() => {
        inputRef.current!.focus();
        inputRef.current!.setSelectionRange(
          startingIndex + 1,
          startingIndex + 1
        );
      }, 0);
    } else if (key.length === 1 && !event.metaKey) {
      setCurrentLineText((prev) => {
        let next = "";
        if (selectionStart !== 0) {
          next =
            prev.slice(0, selectionStart) + key + prev.slice(selectionStart);
        } else {
          next = key + prev;
        }

        return next;
      });
      if (key === "(") {
        setOpenVerseSuggestion(true);
        setCurrentLineText((prev) => {
          const key = ")";
          const next =
            prev.slice(0, selectionStart + 1) +
            key +
            prev.slice(selectionStart + 1);
          setLines((prev) => {
            const result = [...prev];
            result[currentLineIndex] = next;
            return result;
          });
          return next;
        });
      }
      setTimeout(() => {
        inputRef.current!.setSelectionRange(
          selectionStart + 1,
          selectionStart + 1
        );
      }, 0);
    } else if (key === "ArrowDown") {
      event.preventDefault();
      if (!openVerseSuggestion && currentLineIndex + 1 < lines.length) {
        setCurrentLineIndex((prev) => {
          const nextLine = prev + 1;
          setCurrentLineText(lines[nextLine]);
          setLines((prev) => {
            const result = [...prev];
            result[currentLineIndex] = currentLineText;
            return result;
          });
          return nextLine;
        });
      } else {
        setVerseSuggestionIndex(
          suggestionIndex === undefined ? 0 : suggestionIndex + 1
        );
      }
    } else if (key === "ArrowUp") {
      event.preventDefault();
      if (!openVerseSuggestion && currentLineIndex > 0) {
        setCurrentLineIndex((prev) => {
          const nextLine = Math.max(prev - 1, 0);
          setCurrentLineText(lines[nextLine]);
          setLines((prev) => {
            const result = [...prev];
            result[currentLineIndex] = currentLineText;
            return result;
          });
          return nextLine;
        });
      } else {
        setVerseSuggestionIndex(
          suggestionIndex === undefined ? 0 : Math.max(suggestionIndex - 1, 0)
        );
      }
    } else if (
      key === "ArrowLeft" &&
      currentLineIndex > 0 &&
      selectionStart === 0
    ) {
      setCurrentLineIndex((prev) => {
        const nextLine = Math.max(prev - 1, 0);
        setCurrentLineText(lines[nextLine]);
        return nextLine;
      });
      setTimeout(() => {
        inputRef.current!.focus();
        inputRef.current!.setSelectionRange(-1, -1);
      }, 0);
    } else if (
      key === "ArrowRight" &&
      currentLineIndex < lines.length - 1 &&
      selectionStart === currentLineText.length
    ) {
      setCurrentLineIndex((prev) => {
        const nextLine = prev + 1;
        setCurrentLineText(lines[nextLine]);
        setLines((prev) => {
          const result = [...prev];
          result[currentLineIndex] = currentLineText;
          return result;
        });
        return nextLine;
      });
    } else if (key === "Tab") {
      setCurrentLineText((prev) => {
        let next = prev;
        const key = "\t";
        const isList = currentLineText.match(/^[\t ]*(?=-\s)/);
        if (selectionStart !== 0 && !isList && !event.shiftKey) {
          next =
            prev.slice(0, selectionStart) + key + prev.slice(selectionStart);
        } else if (!event.shiftKey) {
          next = key + prev;
        } else if (prev.match(/^\s+/) && event.shiftKey) {
          next = prev.slice(1);
        }
        return next;
      });
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current!.setSelectionRange(
          selectionStart + 1,
          selectionStart + 1
        );
      }, 0);
    } else if (key === "c" && event.metaKey) {
      const { selectionStart, selectionEnd } = inputRef.current;
      const selectedText = currentLineText.slice(selectionStart, selectionEnd);
      await ClipboardSetText(selectedText);
    } else if (key === "x" && event.metaKey) {
      const { selectionStart, selectionEnd } = inputRef.current;
      let selectedText = "";
      if (selectionStart === selectionEnd) {
        selectedText = currentLineText;
        setCurrentLineText(() => {
          const next = currentLineIndex > 0 ? lines[currentLineIndex - 1] : "";
          setLines((prev) => [
            ...prev.slice(0, currentLineIndex - 1),
            ...prev.slice(currentLineIndex),
          ]);
          setCurrentLineIndex((prev) => Math.max(prev - 1, 0));
          return next;
        });
      } else {
        selectedText = currentLineText.slice(selectionStart, selectionEnd);
        setCurrentLineText((prev) => {
          const next = prev.slice(0, selectionStart) + prev.slice(selectionEnd);
          return next;
        });
      }
      await ClipboardSetText(selectedText);
    } else if (key === "v" && event.metaKey) {
      const copiedText = await ClipboardGetText();
      setCurrentLineText((prev) => {
        let next = "";
        if (selectionStart !== 0) {
          next =
            prev.slice(0, selectionStart) +
            copiedText +
            prev.slice(selectionStart);
        } else {
          next = copiedText + prev;
        }
        setLines((prev) => {
          const result = [...prev];
          result[currentLineIndex] = next;
          return result;
        });
        return next;
      });
      setTimeout(() => {
        inputRef.current!.focus();
        inputRef.current!.setSelectionRange(
          selectionStart + copiedText.length,
          selectionStart + copiedText.length
        );
      }, 0);
    } else if (
      key === "z" &&
      event.metaKey &&
      !event.shiftKey &&
      currentLineIndex !== null &&
      currentStateIndex[currentLineIndex] > 0
    ) {
      const updatedStateIndexes = [...currentStateIndex];
      updatedStateIndexes[currentLineIndex] -= 1;

      setCurrentStateIndex(updatedStateIndexes);
      setCurrentLineText(
        history[currentLineIndex][updatedStateIndexes[currentLineIndex]]
      );

      const updatedLines = [...lines];
      updatedLines[currentLineIndex] =
        history[currentLineIndex][updatedStateIndexes[currentLineIndex]];
      setLines(updatedLines);
    }

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

  const handleSave = () => {
    SaveFile("test.md", lines.join("\n")).then(() => console.log("Successful"));
  };

  return (
    <div id="App" className="px-10 py-5">
      <button
        className="p-1 border rounded-md hover:bg-white hover:text-black"
        onClick={handleSave}
      >
        Save
      </button>
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
          className="bg-black text-white outline-none resize-none overflow-hidden z-10 absolute w-full shadow-sm caret-amber-500"
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
    </div>
  );
}

export default App;
