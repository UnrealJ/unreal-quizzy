import { FlashcardSet } from "@/types/flashcard";

const STORAGE_KEY = "quizzy_sets";

export const getSets = (): FlashcardSet[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveSet = (set: FlashcardSet): void => {
  const sets = getSets();
  const index = sets.findIndex((s) => s.id === set.id);
  
  if (index >= 0) {
    sets[index] = set;
  } else {
    sets.push(set);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
};

export const deleteSet = (id: string): void => {
  const sets = getSets().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
};

export const getSet = (id: string): FlashcardSet | undefined => {
  const set = getSets().find((s) => s.id === id);
  if (set && !set.mcqCards) return { ...set, mcqCards: [] };
  return set;
};

const SAVED_CARDS_KEY = "quizzy_saved_cards";

export const getSavedCards = (): Array<{ setId: string; cardId: string }> => {
  const stored = localStorage.getItem(SAVED_CARDS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveCardForLater = (setId: string, cardId: string): void => {
  const saved = getSavedCards();
  if (!saved.find((s) => s.setId === setId && s.cardId === cardId)) {
    saved.push({ setId, cardId });
    localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(saved));
  }
};

export const unsaveCard = (setId: string, cardId: string): void => {
  const saved = getSavedCards().filter(
    (s) => !(s.setId === setId && s.cardId === cardId)
  );
  localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(saved));
};

export const isCardSaved = (setId: string, cardId: string): boolean => {
  return getSavedCards().some((s) => s.setId === setId && s.cardId === cardId);
};

const KNOWN_CARDS_KEY = "quizzy_known_cards";

export const getKnownCards = (): Array<{ setId: string; cardId: string }> => {
  const stored = localStorage.getItem(KNOWN_CARDS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const markCardKnown = (setId: string, cardId: string): void => {
  const known = getKnownCards();
  if (!known.find((s) => s.setId === setId && s.cardId === cardId)) {
    known.push({ setId, cardId });
    localStorage.setItem(KNOWN_CARDS_KEY, JSON.stringify(known));
  }
};

export const unmarkCardKnown = (setId: string, cardId: string): void => {
  const known = getKnownCards().filter(
    (s) => !(s.setId === setId && s.cardId === cardId)
  );
  localStorage.setItem(KNOWN_CARDS_KEY, JSON.stringify(known));
};

export const isCardKnown = (setId: string, cardId: string): boolean => {
  return getKnownCards().some((s) => s.setId === setId && s.cardId === cardId);
};
