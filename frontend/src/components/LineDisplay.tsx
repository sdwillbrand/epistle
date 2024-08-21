import { useMemo, useState } from "react";
import L1545 from "../L1545";

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

const BibleVerse = ({ verse, content }: { verse: string; content: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="text-amber-500 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {verse}
      {isHovered && <VerseTooltip verse={content} />}
    </span>
  );
};

const VerseTooltip = ({ verse }: { verse: string }) => {
  return (
    <div className="absolute bg-gray-100 p-2 rounded shadow-lg z-20 text-black w-80">
      {verse}
    </div>
  );
};

const tokenizeText = (text: string) => {
  const bibleVerseRegex = /(\(\b(\d\.)?\s?[A-Za-zäöüÄÖÜß]+(\.)?\s\d+.\d+\b\))/g;
  const tokens: (
    | { type: "verse"; content: string; verse: string }
    | { type: "text"; content: string }
  )[] = [];
  let lastIndex = 0;

  // Use matchAll to find all regex matches
  const matches = [...text.matchAll(bibleVerseRegex)];
  for (const match of matches) {
    const [verseMatch] = match;
    const offset = match.index;

    // Add text before the matched verse as a token
    if (offset > lastIndex) {
      tokens.push({ type: "text", content: text.slice(lastIndex, offset) });
    }
    const regex = /^((\d\.)?[A-Za-zäöüÄÖÜß]+)\s(\d+)\.(\d+)$/;

    const extractedVerse = verseMatch.slice(1, -1).match(regex);
    if (extractedVerse) {
      const book = extractedVerse[1];
      const chapter = extractedVerse[3];
      const verse = extractedVerse[4];
      const foundVerse =
        L1545[book] && L1545[book][chapter]
          ? L1545[book][chapter][verse]
          : null;
      if (!foundVerse) {
        continue;
      }
      tokens.push({ type: "verse", content: foundVerse, verse: verseMatch });
    }

    // Update the lastIndex to the end of the current match
    lastIndex = offset + verseMatch.length;
  }

  // Add any remaining text after the last match as a token
  if (lastIndex < text.length) {
    tokens.push({ type: "text", content: text.slice(lastIndex) });
  }
  return tokens;
};
