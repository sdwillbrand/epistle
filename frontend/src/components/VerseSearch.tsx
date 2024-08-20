import { useEffect, useState } from "react";
import classNames from "classnames";
import Fuse, { IFuseOptions } from "fuse.js";
import { useSetAtom } from "jotai";
import { openVerseSuggestionAtom } from "../atoms";
import L1545 from "../L1545";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  input: string;
  selectedIndex?: number;
  book?: string;
  chapter?: number;
  verse?: number;
}

type Bible = typeof L1545; // Type of the Bible structure
type Books = (keyof Bible)[]; // Array of book names
type ChaptersOfBook<Book extends keyof Bible> = keyof Bible[Book]; // Chapters of a specific book
type VersesOfChapter<
  Book extends keyof Bible,
  Chapter extends keyof Bible[Book]
> = keyof Bible[Book][Chapter]; // Verses of a specific chapter

const suggestions: string[] = []; // Array to store suggestions

// Get the book names (keys of the Bible object)
const books = Object.keys(L1545) as Books;

// Iterate over each book
for (const book of books) {
  // Get the chapters for the current book
  const chapters = Object.keys(L1545[book]) as Array<
    ChaptersOfBook<typeof book>
  >;

  // Iterate over each chapter
  for (const chapter of chapters) {
    // Get the verses for the current chapter of the current book
    const verses = Object.keys(L1545[book][chapter]) as Array<
      VersesOfChapter<typeof book, typeof chapter>
    >;

    // Iterate over each verse and create suggestions
    for (const verse of verses) {
      // Add a suggestion to the array in the format "Book Chapter:Verse"
      suggestions.push(`${book} ${chapter}.${verse}`);
    }
    suggestions.push(`${book} ${chapter}`);
  }
  suggestions.push(book);
}

const fuseOptions: IFuseOptions<string> = {
  distance: 100, // Smaller distance for structured data
  threshold: 0.25, // A moderate threshold for close matches
  minMatchCharLength: 3, // Allow shorter queries (e.g., "Ge" for "Genesis")
  shouldSort: true, // Sort results by relevance
  ignoreLocation: true, // Location should not heavily influence match quality
  includeScore: true, // Include the score in the search result for better insight
  useExtendedSearch: true, // Allows for more advanced search options
};

export const VerseSuggestion = ({
  input,
  style,
  className,
  hidden,
  selectedIndex,
}: Props) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState<Array<string>>(
    []
  );
  const setOpenVerseSuggestion = useSetAtom(openVerseSuggestionAtom);
  useEffect(() => {
    const result = new Fuse(suggestions, fuseOptions)
      .search(input)
      .map((res) => res.item);
    if (result.length === 0) {
      setOpenVerseSuggestion(false);
    } else {
      setOpenVerseSuggestion(true);
    }
    setSelectedSuggestions(result);
  }, [input]);

  return (
    <>
      {selectedSuggestions.length > 0 && (
        <div
          style={style}
          className={classNames(
            className,
            "max-h-56 overflow-scroll mt-1 border absolute pl-1 pr-4"
          )}
          hidden={hidden}
          tabIndex={1}
        >
          {selectedSuggestions.map((book, i) => (
            <div
              key={book}
              className={classNames("cursor-pointer hover:bg-slate-600", {
                "bg-slate-600":
                  selectedIndex !== undefined && i === selectedIndex,
              })}
            >
              {book}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
