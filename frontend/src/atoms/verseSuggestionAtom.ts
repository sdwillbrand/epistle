import { atom } from "jotai";

interface VerseSuggestion {
  index?: number;
  open: boolean;
}

export const verseSuggestionIndexAtom = atom<number | undefined>(undefined);
export const openVerseSuggestionAtom = atom<boolean>(false);
export const suggestionAtom = atom<string>("");
