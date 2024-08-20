import { useState, KeyboardEvent, useRef, useEffect } from "react";
import classNames from "classnames";
import { SaveFile } from "../wailsjs/go/main/App";
import { ClipboardGetText, ClipboardSetText } from "../wailsjs/runtime";

function App() {
  const [content, setContent] = useState("");
  const [lines, setLines] = useState([""]);
  const [currentLine, setCurrentLine] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const canvasRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    console.log({ lines });
  });

  useEffect(() => {
    if (canvasRef.current)
      canvasRef.current = document.createElement("canvas").getContext("2d");
  }, []);

  const handleKeys = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!inputRef.current) return;
    const key = event.key;
    const cursorPos = inputRef.current!.selectionStart;

    if (key === "Enter") {
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
      setContent(
        new Array(identLevel).fill("\t").join("") + (isList ? "- " : "")
      );
      setCurrentLine((prev) => prev + 1);
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
    } else if (key === "Backspace" && content) {
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
      setTimeout(() => {
        inputRef.current!.focus();
        inputRef.current!.setSelectionRange(cursorPos + 1, cursorPos + 1);
      }, 1);
    } else if (key === "ArrowDown" && currentLine + 1 < lines.length) {
      setCurrentLine((prev) => {
        const nextLine = prev + 1;
        setContent(lines[nextLine]);
        return nextLine;
      });
    } else if (key === "ArrowUp" && currentLine > 0) {
      setCurrentLine((prev) => {
        const nextLine = Math.max(prev - 1, 0);
        setContent(lines[nextLine]);
        return nextLine;
      });
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
      const selectedText = content.slice(selectionStart, selectionEnd);
      await ClipboardSetText(selectedText);
      setContent((prev) => {
        const next = prev.slice(0, selectionStart) + prev.slice(selectionEnd);
        setLines((prev) => {
          const result = [...prev];
          result[currentLine] = next;
          return result;
        });
        return next;
      });
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
    SaveFile("test.txt", lines.join("\n")).then(() =>
      console.log("Successful")
    );
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
              const getCaretIndexAtPosition = (
                input: HTMLTextAreaElement,
                relativeX: number
              ) => {
                const canvas = canvasRef.current;
                if (!canvas) return -1;
                const text = input.value;
                let position = -1;

                // Get the font style from the input
                const fontStyle = window.getComputedStyle(input).font;
                canvas.font = fontStyle;

                let totalWidth = 0;
                for (let i = 0; i < text.length; i++) {
                  const charWidth = canvas.measureText(text[i]).width;
                  totalWidth += charWidth;

                  if (totalWidth >= relativeX) {
                    position = i;
                    break;
                  }
                }

                return position;
              };

              setTimeout(() => {
                if (inputRef.current) {
                  const input = inputRef.current;

                  // Focus the input
                  input.focus();

                  // Calculate the mouse position relative to the input element
                  const { left } = input.getBoundingClientRect();
                  const relativeX = mouseX - left;

                  // Find the character index at the mouse position
                  const position = getCaretIndexAtPosition(input, relativeX);

                  // Set the caret position
                  input.setSelectionRange(position, position);
                }
              }, 1);
            }}
          >
            <span className="m-0 p-0">
              {line &&
                [...line].map((c) => (c === "\t" ? <span>&emsp;</span> : c))}
            </span>
          </div>
        ))}
        <textarea
          ref={inputRef}
          onKeyDown={handleKeys}
          className="bg-black text-white outline-none resize-none overflow-hidden z-10 absolute w-full shadow-sm"
          style={{ top: `${currentLine * 20}px`, height: "24px" }}
          value={content}
        />
      </div>
    </div>
  );
}

export default App;
