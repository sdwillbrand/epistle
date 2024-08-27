import { useState } from "react";
import { VerseTooltip } from "./VerseToolTip";

export const BibleVerse = ({
  verse,
  content,
}: {
  verse: string;
  content: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="text-amber-500 cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {verse}
      {isHovered && <VerseTooltip verse={content} />}
    </span>
  );
};
