export interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MCQCard {
  id: string;
  question: string;
  options: MCQOption[];
}

export interface FlashcardSet {
  id: string;
  title: string;
  cards: Flashcard[];
  mcqCards: MCQCard[];
  createdAt: string;
  updatedAt: string;
}
