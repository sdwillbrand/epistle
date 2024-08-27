export const VerseTooltip = ({ verse }: { verse: string }) => {
  return (
    <div className="absolute bg-gray-100 p-2 rounded shadow-lg z-20 text-black w-80 left-0">
      {verse}
    </div>
  );
};
