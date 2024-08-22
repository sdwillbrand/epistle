import { useAtom, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { inputRefAtom } from "../atoms/inputRefAtom";

export function useLineEditor() {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [inputRef, setInputRef] = useAtom(inputRefAtom);
  const canvasRef = useRef<CanvasRenderingContext2D | null>(null);
  useEffect(() => {
    if (!canvasRef.current)
      canvasRef.current = document.createElement("canvas").getContext("2d");
  }, []);

  useEffect(() => {
    if (ref.current && !inputRef) {
      setInputRef(ref.current);
    }
  }, [ref]);

  const getCaretIndexAtPosition = (relativeX: number) => {
    const input = ref.current;
    if (!input) return -1;
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("no canvas");
      return -1;
    }
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

  const measureText = (text: string) => {
    const canvas = canvasRef.current;
    const input = ref.current;
    if (!input) return 0;
    if (!canvas) {
      console.log("no canvas");
      return 0;
    }

    const fontStyle = window.getComputedStyle(input).font;
    canvas.font = fontStyle;

    let totalWidth = 0;
    for (let i = 0; i < text.length; i++) {
      const charWidth = canvas.measureText(text[i]).width;
      totalWidth += charWidth;
    }
    return totalWidth;
  };
  return { ref: ref, getCaretIndexAtPosition, measureText };
}
