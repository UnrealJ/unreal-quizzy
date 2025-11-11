export interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  cards: Flashcard[];
  createdAt: string;
  updatedAt: string;
}
