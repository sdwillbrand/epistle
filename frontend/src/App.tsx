import { FormEvent, useEffect, useState, KeyboardEvent, useRef } from "react";
import classNames from "classnames";

function App() {
  const [content, setContent] = useState("");
  const [lines, setLines] = useState([""]);
  const [currentLine, setCurrentLine] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleKeys = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!inputRef.current) return;
    const key = event.key;
    console.log({ pos: inputRef.current.selectionStart });
    console.log({ key });
    console.log({ lines });
    const cursorPos = inputRef.current!.selectionStart;

    if (key === "Enter") {
      setLines((prev) => {
        const result = [...prev];
        result[currentLine] = content;
        result.push("");
        return result;
      });
      setContent("");
      setCurrentLine((prev) => prev + 1);
    } else if (key === "Backspace" && !content) {
      setCurrentLine((prev) => {
        const nextLine = Math.max(prev - 1, 0);
        setContent(lines[nextLine]);
        setLines((prev) => {
          const result = [...prev];
          result.pop();
          return result;
        });
        return nextLine;
      });
    } else if (key === "Backspace") {
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
    }
  };

  return (
    <div id="App" className="px-10 py-5">
      <div className={classNames("h-full outline-transparent relative")}>
        {lines.map((line, i) => (
          <div
            className={classNames({
              hidden: i === currentLine,
            })}
            key={i}
            style={{ top: `${i * 20}px`, minHeight: "24px" }}
          >
            <span className="m-0 p-0">{line}</span>
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
