import { editorStore } from "@/App";
import { atom, SetStateAction } from "jotai";
import { currentLineIndexAtom } from "./currentLineIndexAtom";

export interface File {
  _id: string;
  lines: string[];
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export const filesAtom = atom<File[]>([
  { _id: "test", name: "test", lines: ["Test"] },
  { _id: "test1", name: "test1", lines: ["Test1"] },
]);

export const currentFileIndexAtom = atom(0);

export const currentLineTextAtom = atom(
  (get) => {
    const fileIndex = get(currentFileIndexAtom);
    const lineIndex = get(currentLineIndexAtom);
    const lines = get(filesAtom)[fileIndex]?.lines || [];
    return lines[lineIndex] || "";
  },
  (get, set, action: SetStateAction<string>) => {
    console.log("UPDATING");
    const fileIndex = get(currentFileIndexAtom);
    const lineIndex = get(currentLineIndexAtom);

    // Handle SetStateAction<string>: it can be a function or a direct value
    const currentLineText = get(currentLineTextAtom);
    console.log({ lineIndex, currentLineText });
    const newLineText =
      typeof action === "function"
        ? (action as (prevText: string) => string)(currentLineText)
        : action;

    set(filesAtom, (prev) => {
      const updatedFiles = [...prev]; // Create a shallow copy of the files array
      const file = updatedFiles[fileIndex];

      if (file) {
        const updatedLines = [...file.lines]; // Create a shallow copy of the lines array
        updatedLines[lineIndex] = newLineText; // Update the specific line
        updatedFiles[fileIndex] = {
          ...file, // Copy the current file's data
          lines: updatedLines, // Update the lines
        };
      }

      return updatedFiles; // Return the updated files array
    });
  }
);

export const editorLinesAtom = atom(
  (get) => {
    const result = get(filesAtom)[get(currentFileIndexAtom)].lines;
    console.log({ result });
    return result;
  },
  (get, set, action: SetStateAction<string[]>) => {
    console.log({ action });
    set(filesAtom, (prev) => {
      const currentFileIndex = get(currentFileIndexAtom);
      const updatedFiles = [...prev]; // Create a shallow copy of the files array

      // Handle the SetStateAction: it can be a function or a direct value
      const updatedLines =
        typeof action === "function"
          ? (action as (prevLines: string[]) => string[])(
              updatedFiles[currentFileIndex].lines
            )
          : action;

      // Update the current file's lines
      updatedFiles[currentFileIndex] = {
        ...updatedFiles[currentFileIndex], // Copy the current file's data
        lines: updatedLines, // Update the lines
      };
      console.log({ updatedLines });
      return updatedFiles; // Return the updated files array
    });
  }
);
