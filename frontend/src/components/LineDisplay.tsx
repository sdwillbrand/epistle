import { useMemo, useState } from "react";
import { tokenizeText } from "../utils/tokenizeText";
import { BibleVerse } from "./BibleVerse";
import classNames from "classnames";

interface Props {
  line: string;
}

export const LineDisplay = ({ line }: Props) => {
  const tokens = useMemo(() => tokenizeText(line), [line]);

  const isTitle = useMemo(() => line.startsWith("# "), [line]);

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
            <span key={index} className={classNames({ "text-3xl": isTitle })}>
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
