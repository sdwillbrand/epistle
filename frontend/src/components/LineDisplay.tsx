import { useMemo, useState } from "react";
import L1545 from "../L1545";
import { tokenizeText } from "../utils/tokenizeText";
import { BibleVerse } from "./BibleVerse";

interface Props {
  line: string;
}

export const LineDisplay = ({ line }: Props) => {
  const tokens = useMemo(() => tokenizeText(line), [line]);

  return (
    <div className="relative">
      {tokens.map((token, index) => {
        if (token.type === "verse") {
          return (
            <BibleVerse
              key={index}
              verse={token.verse}
              content={token.content}
            />
          );
        } else {
          return (
            <span key={index}>
              {[...token.content].map((c, i) =>
                c === "\t" ? <span key={c + i}>&emsp;</span> : c
              )}
            </span>
          );
        }
      })}
    </div>
  );
};
