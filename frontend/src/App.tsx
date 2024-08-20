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

function App() {
  const [content, setContent] = useState("");
  const [lines, setLines] = useState([""]);
  const [currentLine, setCurrentLine] = useState(0);
  const { open: openVerseSuggestion, index: suggestionIndex } =
    useAtomValue(verseSuggestionAtom);
  const setOpenVerseSuggestion = useSetAtom(openVerseSuggestionAtom);
  const setVerseSuggestionIndex = useSetAtom(verseSuggestionIndexAtom);
  const [suggestion, setSuggestion] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const { getCaretIndexAtPosition, measureText } = useTextWidth(inputRef);

  useEffect(() => {
    const result = content.match(/\(([^)]+)\)$/); // Match the slash followed by non-whitespace characters
    if (!result) {
      setSuggestion("");
    } else {
      setSuggestion(result[0].slice(1, -1)); // Extract the suggestion by removing the slash
    }
  }, [content]);

  const handleKeys = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!inputRef.current) return;
    const key = event.key;
    const cursorPos = inputRef.current!.selectionStart;
    if (key === "Enter") {
      if (!openVerseSuggestion) {
        setLines((prev) => {
          const result = [...prev];
          result[currentLine] = content;
          result.push("");
          return result;
        });
        let identLevel = 0;
        for (const c of content) {
          if (c !== "\t") {
            break;
          }
          identLevel++;
        }
        const isList = lines[currentLine].match(/\s*(?=-\s*\w)/);
        setContent("\t".repeat(identLevel) + (isList ? "- " : ""));
        setCurrentLine((prev) => prev + 1);
      } else {
      }
    } else if (key === "Backspace" && !content) {
      setCurrentLine((prev) => {
        const nextLine = Math.max(prev - 1, 0);
        setContent(lines[nextLine]);
        if (currentLine > 0)
          setLines((prev) => {
            const result = [...prev];
            result.pop();
            return result;
          });
        return nextLine;
      });
    } else if (
      key === "Backspace" &&
      content &&
      !event.metaKey &&
      !event.altKey
    ) {
      setContent((prev) => {
        let next = prev.slice(0, cursorPos! - 1) + prev.slice(cursorPos);
        if (cursorPos === prev.length) {
          next = prev.slice(0, -1);
        }
        setLines((prev) => {
          const result = [...prev];
          result[currentLine] = next;
          return result;
        });
        return next;
      });
      setTimeout(() => {
        inputRef.current!.focus();
        inputRef.current!.setSelectionRange(cursorPos - 1, cursorPos - 1);
      }, 1);
    } else if (key === "Backspace" && event.metaKey) {
      setContent(() => {
        const next = "";
        setLines((prev) => {
          const result = [...prev];
          result[currentLine] = next;
          return result;
        });
        return next;
      });
    } else if (key === "Backspace" && event.altKey) {
      setContent((prev) => {
        const index = prev.trim().lastIndexOf(" ");
        const next = prev.slice(0, index + 1);
        setLines((prev) => {
          const result = [...prev];
          result[currentLine] = next;
          return result;
        });
        return next;
      });
    } else if (key.length === 1 && !event.metaKey) {
      setContent((prev) => {
        let next = "";
        if (cursorPos !== 0) {
          next = prev.slice(0, cursorPos) + key + prev.slice(cursorPos);
        } else {
          next = key + prev;
        }
        setLines((prev) => {
          const result = [...prev];
          result[currentLine] = next;
          return result;
        });
        return next;
      });
      if (key === "(") {
        setOpenVerseSuggestion(true);
        setContent((prev) => {
          const key = ")";
          const next =
            prev.slice(0, cursorPos + 1) + key + prev.slice(cursorPos + 1);
          setLines((prev) => {
            const result = [...prev];
            result[currentLine] = next;
            return result;
          });
          return next;
        });
      }
      setTimeout(() => {
        inputRef.current!.focus();
        inputRef.current!.setSelectionRange(cursorPos + 1, cursorPos + 1);
      }, 1);
    } else if (key === "ArrowDown") {
      event.preventDefault();
      if (!openVerseSuggestion && currentLine + 1 < lines.length) {
        setCurrentLine((prev) => {
          const nextLine = prev + 1;
          setContent(lines[nextLine]);
          return nextLine;
        });
      } else {
        setVerseSuggestionIndex(
          suggestionIndex === undefined ? 0 : suggestionIndex + 1
        );
      }
    } else if (key === "ArrowUp") {
      event.preventDefault();
      if (!openVerseSuggestion && currentLine > 0) {
        setCurrentLine((prev) => {
          const nextLine = Math.max(prev - 1, 0);
          setContent(lines[nextLine]);
          return nextLine;
        });
      } else {
        setVerseSuggestionIndex(
          suggestionIndex === undefined ? 0 : Math.max(suggestionIndex - 1, 0)
        );
      }
    } else if (key === "ArrowLeft" && currentLine > 0 && cursorPos === 0) {
      setCurrentLine((prev) => {
        const nextLine = Math.max(prev - 1, 0);
        setContent(lines[nextLine]);
        return nextLine;
      });
      setTimeout(() => {
        inputRef.current!.focus();
        inputRef.current!.setSelectionRange(-1, -1);
      }, 1);
    } else if (
      key === "ArrowRight" &&
      currentLine < lines.length - 1 &&
      cursorPos === content.length
    ) {
      setCurrentLine((prev) => {
        const nextLine = prev + 1;
        setContent(lines[nextLine]);
        return nextLine;
      });
    } else if (key === "Tab") {
      setContent((prev) => {
        let next = prev;
        const key = "\t";
        const isList = content.match(/^[\t ]*(?=-\s)/);
        if (cursorPos !== 0 && !isList && !event.shiftKey) {
          next = prev.slice(0, cursorPos) + key + prev.slice(cursorPos);
        } else if (!event.shiftKey) {
          next = key + prev;
        } else if (prev.match(/^\s+/) && event.shiftKey) {
          next = prev.slice(1);
        }
        setLines((prev) => {
          const result = [...prev];
          result[currentLine] = next;
          return result;
        });
        return next;
      });
      setTimeout(() => {
        inputRef.current!.focus();
        inputRef.current!.setSelectionRange(cursorPos + 1, cursorPos + 1);
      }, 1);
    } else if (key === "c" && event.metaKey) {
      const { selectionStart, selectionEnd } = inputRef.current;
      const selectedText = content.slice(selectionStart, selectionEnd);
      await ClipboardSetText(selectedText);
    } else if (key === "x" && event.metaKey) {
      const { selectionStart, selectionEnd } = inputRef.current;
      let selectedText = "";
      if (selectionStart === selectionEnd) {
        selectedText = content;
        setContent(() => {
          const next = currentLine > 0 ? lines[currentLine - 1] : "";
          setLines((prev) => [
            ...prev.slice(0, currentLine - 1),
            ...prev.slice(currentLine),
          ]);
          setCurrentLine((prev) => Math.max(prev - 1, 0));
          return next;
        });
      } else {
        selectedText = content.slice(selectionStart, selectionEnd);
        setContent((prev) => {
          const next = prev.slice(0, selectionStart) + prev.slice(selectionEnd);
          setLines((prev) => {
            const result = [...prev];
            result[currentLine] = next;
            return result;
          });
          return next;
        });
      }
      await ClipboardSetText(selectedText);
    } else if (key === "v" && event.metaKey) {
      const copiedText = await ClipboardGetText();
      setContent((prev) => {
        let next = "";
        if (cursorPos !== 0) {
          next = prev.slice(0, cursorPos) + copiedText + prev.slice(cursorPos);
        } else {
          next = copiedText + prev;
        }
        setLines((prev) => {
          const result = [...prev];
          result[currentLine] = next;
          return result;
        });
        return next;
      });
      setTimeout(() => {
        inputRef.current!.focus();
        inputRef.current!.setSelectionRange(
          cursorPos + copiedText.length,
          cursorPos + copiedText.length
        );
      }, 1);
    }
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
              hidden: i === currentLine,
            })}
            key={i}
            style={{ top: `${i * 20}px`, minHeight: "20px" }}
            onClick={(e) => {
              setCurrentLine(i);
              setContent(lines[i]);
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
            <span className="m-0 p-0">
              {line &&
                [...line].map((c, i) =>
                  c === "\t" ? <span key={c + i}>&emsp;</span> : c
                )}
            </span>
          </div>
        ))}
        <textarea
          ref={inputRef}
          onKeyDown={handleKeys}
          className="bg-black text-white outline-none resize-none overflow-hidden z-10 absolute w-full shadow-sm caret-amber-500"
          style={{ top: `${currentLine * 20}px`, height: "24px" }}
          value={content}
        />
        <VerseSuggestion
          hidden={!openVerseSuggestion}
          input={suggestion}
          selectedIndex={suggestionIndex}
          style={{
            top: `${(currentLine + 1) * 20}px`,
            left: `${measureText(
              content.slice(0, inputRef.current?.selectionStart ?? 0)
            )}px`,
          }}
        />
      </div>
    </div>
  );
}

export default App;
