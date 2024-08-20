import { atom, SetStateAction } from "jotai";

interface VerseSuggestion {
  index?: number;
  open: boolean;
}

export const indexAtom = atom<number | undefined>(undefined);
export const openAtom = atom<boolean>(false);

export const verseSuggestionAtom = atom<
  VerseSuggestion,
  [VerseSuggestion],
  void
>(
  (get) => ({ index: get(indexAtom), open: get(openAtom) }),
  (get, set, newVerseSuggestion) => {
    const open = get(openAtom);
    set(indexAtom, open ? newVerseSuggestion.index : undefined);
    set(openAtom, newVerseSuggestion.open);
  }
);

export const openVerseSuggestionAtom = atom<null, [boolean], void>(
  null,
  (get, set, open) => {
    set(verseSuggestionAtom, {
      ...get(verseSuggestionAtom),
      open,
    });
  }
);

export const verseSuggestionIndexAtom = atom<null, [number], void>(
  null,
  (get, set, index) => {
    const verseSuggestion = get(verseSuggestionAtom);
    set(verseSuggestionAtom, {
      ...verseSuggestion,
      index,
    });
  }
);
