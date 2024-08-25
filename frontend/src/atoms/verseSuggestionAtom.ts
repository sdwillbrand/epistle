import { atom } from "jotai";

export const verseSuggestionIndexAtom = atom<number | undefined>(undefined);
export const openVerseSuggestionAtom = atom<boolean>(false);
export const suggestionAtom = atom<string>("");
