import { useState, KeyboardEvent, useRef } from "react";
import classNames from "classnames";
import { SaveFile } from "../wailsjs/go/main/App";

function App() {
  const [content, setContent] = useState("");
  const [lines, setLines] = useState([""]);
  const [currentLine, setCurrentLine] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleKeys = (event: KeyboardEvent<HTMLTextAreaElement>) => {
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
    } else if (key.length === 1) {
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
            className={classNames({
              hidden: i === currentLine,
            })}
            key={i}
            style={{ top: `${i * 20}px`, minHeight: "24px" }}
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
          className="bg-black text-white outline-none resize-none w-full overflow-hidden z-10 absolute"
          style={{ top: `${currentLine * 24}px`, height: "24px" }}
          value={content}
        />
      </div>
    </div>
  );
}

export default App;
