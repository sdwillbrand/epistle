import { currentFileIndexAtom, filesAtom } from "@/atoms/filesAtom";
import classNames from "classnames";
import { useAtom, useAtomValue } from "jotai";

interface Props {
  open: boolean;
}

export const FileDrawer = ({ open }: Props) => {
  const files = useAtomValue(filesAtom);
  const [currentFileIndex, setCurrentFileIndex] = useAtom(currentFileIndexAtom);
  return (
    <div
      className={classNames(
        "fixed top-0 right-0 shadow-2xl pl-4 pr-20 pt-1 bg-blue-950 h-full z-50"
      )}
      hidden={!open}
    >
      <h1>Explorer</h1>
      <div className="w-full border-1 border mb-2"></div>
      {files.map((file, i) => (
        <div
          key={file._id}
          className={classNames("cursor-pointer text-slate-100 px-1", {
            "bg-black/50": i === currentFileIndex,
          })}
          onClick={() => setCurrentFileIndex(i)}
        >
          {file.name}
        </div>
      ))}
    </div>
  );
};
