export type PieceColor = 'white' | 'black';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export interface Square {
  file: string;
  rank: number;
  piece: ChessPiece | null;
}

export type SkillLevel = 'locked' | 'active' | 'complete' | 'mastered';

export interface LessonStep {
  type: 'text' | 'board' | 'quiz' | 'interactive';
  title?: string;
  content: string;
  fen?: string;
  choices?: { text: string; correct: boolean }[];
  highlightSquares?: string[];
  arrows?: { from: string; to: string; color?: string }[];
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  xpReward: number;
  steps: LessonStep[];
  completed?: boolean;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  level: number;
  lessons: Lesson[];
  requiredXP: number;
}

export interface LichessPuzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  gameUrl?: string;
}

export interface UserProgress {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  completedLessons: string[];
  completedPuzzles: string[];
  unlockedUnits: string[];
  hearts: number;
  maxHearts: number;
  gems: number;
}

export interface PuzzleResult {
  puzzleId: string;
  solved: boolean;
  movesUsed: number;
  hintsUsed: number;
  xpEarned: number;
  timeSeconds: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  xp: number;
  streak: number;
  avatarUrl?: string;
  rank: number;
}
