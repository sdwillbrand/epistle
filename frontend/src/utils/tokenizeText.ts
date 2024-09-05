import BibleBookMappings from "@/BibleBookMappings";
import L1545 from "@/L1545";

export const tokenizeText = (text: string) => {
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
    const offset = match.index!;

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
      const mappedBook = BibleBookMappings[book];
      console.log({ book, mappedBook });
      const foundVerse =
        L1545[mappedBook] && L1545[mappedBook][chapter]
          ? L1545[mappedBook][chapter][verse]
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
