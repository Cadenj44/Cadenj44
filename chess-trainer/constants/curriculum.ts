import { Unit } from '@/types';

export const CURRICULUM: Unit[] = [
  {
    id: 'basics',
    title: 'Board Basics',
    description: 'Learn how pieces move and the rules of chess',
    icon: '♟️',
    color: '#58CC02',
    level: 1,
    requiredXP: 0,
    lessons: [
      {
        id: 'basics-1',
        unitId: 'basics',
        title: 'The Chess Board',
        description: 'Files, ranks, and coordinates',
        xpReward: 20,
        steps: [
          {
            type: 'text',
            title: 'Welcome to Chess!',
            content: 'The chess board is an 8×8 grid. Files go from **a** to **h** (left to right), and ranks go from **1** to **8** (bottom to top). Every square has a unique name — like e4 or d5.',
          },
          {
            type: 'board',
            title: 'The Starting Position',
            content: 'This is how a chess game begins. White starts at the bottom (ranks 1–2), Black at the top (ranks 7–8).',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            highlightSquares: ['e1', 'e8'],
          },
          {
            type: 'quiz',
            title: 'Quick Check',
            content: 'Which square is in the center of the board?',
            choices: [
              { text: 'e4', correct: false },
              { text: 'a1', correct: false },
              { text: 'd4', correct: false },
              { text: 'e4 and d5 are both central', correct: true },
            ],
          },
        ],
      },
      {
        id: 'basics-2',
        unitId: 'basics',
        title: 'How Pawns Move',
        description: 'The foot soldiers of chess',
        xpReward: 20,
        steps: [
          {
            type: 'text',
            title: 'Pawn Movement',
            content: 'Pawns move **forward** one square at a time. On their first move, they can advance **two squares**. Pawns capture **diagonally** — one square forward to the left or right.',
          },
          {
            type: 'board',
            title: 'Pawn on e2',
            content: 'This pawn on e2 can move to e3 or e4 (its first move). It captures on d3 or f3.',
            fen: '8/8/8/8/8/8/4P3/8 w - - 0 1',
            highlightSquares: ['e3', 'e4', 'd3', 'f3'],
            arrows: [{ from: 'e2', to: 'e4', color: '#58CC02' }],
          },
          {
            type: 'quiz',
            title: 'Pawn Capture',
            content: 'A white pawn is on d4. There is a black piece on e5. Can the pawn capture it?',
            choices: [
              { text: 'Yes, diagonally forward', correct: true },
              { text: 'No, pawns cannot capture', correct: false },
              { text: 'Only if it is the pawn\'s first move', correct: false },
            ],
          },
        ],
      },
      {
        id: 'basics-3',
        unitId: 'basics',
        title: 'Knights & Bishops',
        description: 'The minor pieces',
        xpReward: 25,
        steps: [
          {
            type: 'text',
            title: 'The Knight',
            content: 'Knights move in an **L-shape**: two squares in one direction and one square perpendicular. They are the only pieces that can **jump over** other pieces!',
          },
          {
            type: 'board',
            title: 'Knight on e4',
            content: 'A knight on e4 can jump to 8 different squares.',
            fen: '8/8/8/8/4N3/8/8/8 w - - 0 1',
            highlightSquares: ['d6', 'f6', 'g5', 'g3', 'f2', 'd2', 'c3', 'c5'],
          },
          {
            type: 'text',
            title: 'The Bishop',
            content: 'Bishops move **diagonally** any number of squares. Each player has two bishops — one stays on light squares, one on dark squares, forever.',
          },
        ],
      },
      {
        id: 'basics-4',
        unitId: 'basics',
        title: 'Rooks & Queens',
        description: 'The heavy pieces',
        xpReward: 25,
        steps: [
          {
            type: 'text',
            title: 'The Rook',
            content: 'Rooks move **horizontally or vertically** any number of squares. They are most powerful in open files and on the 7th rank.',
          },
          {
            type: 'text',
            title: 'The Queen',
            content: 'The queen combines the power of rook and bishop — she can move **any direction** any number of squares. She is the most powerful piece on the board.',
          },
          {
            type: 'quiz',
            title: 'Queen vs Rook',
            content: 'Which piece can move diagonally?',
            choices: [
              { text: 'Rook only', correct: false },
              { text: 'Queen only', correct: false },
              { text: 'Both Queen and Bishop', correct: true },
              { text: 'Neither', correct: false },
            ],
          },
        ],
      },
      {
        id: 'basics-5',
        unitId: 'basics',
        title: 'The King & Check',
        description: 'Protect your king at all costs',
        xpReward: 30,
        steps: [
          {
            type: 'text',
            title: 'The King',
            content: 'The king moves one square in any direction. Your king must never move into **check** (attacked by an enemy piece). If your king is in check, you must get out immediately.',
          },
          {
            type: 'text',
            title: 'Checkmate',
            content: '**Checkmate** ends the game — the king is in check with no escape. The player who checkmates wins. This is the ultimate goal of chess.',
          },
        ],
      },
    ],
  },
  {
    id: 'piece-values',
    title: 'Piece Values',
    description: 'Learn the value of every piece and when to trade',
    icon: '⚖️',
    color: '#1CB0F6',
    level: 2,
    requiredXP: 100,
    lessons: [
      {
        id: 'values-1',
        unitId: 'piece-values',
        title: 'Material Count',
        description: 'Counting who is winning',
        xpReward: 25,
        steps: [
          {
            type: 'text',
            title: 'Point Values',
            content: 'Every piece has a standard value:\n\n♟ Pawn = **1 point**\n♞ Knight = **3 points**\n♝ Bishop = **3 points**\n♜ Rook = **5 points**\n♛ Queen = **9 points**\n♚ King = **∞** (priceless)',
          },
          {
            type: 'quiz',
            title: 'Fair Trade?',
            content: 'Is trading your rook for a knight a good deal for you?',
            choices: [
              { text: 'Yes, rooks and knights are equal', correct: false },
              { text: 'No, you lose 2 points of material', correct: true },
              { text: 'It depends on the position', correct: false },
            ],
          },
        ],
      },
      {
        id: 'values-2',
        unitId: 'piece-values',
        title: 'The Bishop Pair',
        description: 'Two bishops are stronger together',
        xpReward: 30,
        steps: [
          {
            type: 'text',
            title: 'Bishop vs Knight',
            content: 'While bishops and knights are both worth 3 points, **two bishops together** (the bishop pair) are worth slightly more because they cover all squares. In open positions, bishops often outperform knights.',
          },
        ],
      },
    ],
  },
  {
    id: 'tactics',
    title: 'Basic Tactics',
    description: 'Forks, pins, skewers, and discovered attacks',
    icon: '⚔️',
    color: '#FF9600',
    level: 3,
    requiredXP: 250,
    lessons: [
      {
        id: 'tactics-1',
        unitId: 'tactics',
        title: 'The Fork',
        description: 'Attack two pieces at once',
        xpReward: 30,
        steps: [
          {
            type: 'text',
            title: 'What is a Fork?',
            content: 'A **fork** is when one piece attacks two (or more) enemy pieces simultaneously. The opponent can only save one — you win the other for free!',
          },
          {
            type: 'board',
            title: 'Knight Fork',
            content: 'The knight on e5 forks both the black king on g6 and the queen on c6. Black must move the king — and lose the queen.',
            fen: '8/8/2q3k1/4N3/8/8/8/8 w - - 0 1',
            highlightSquares: ['g6', 'c6'],
            arrows: [{ from: 'e5', to: 'g6', color: '#FF9600' }, { from: 'e5', to: 'c6', color: '#FF9600' }],
          },
          {
            type: 'quiz',
            title: 'Spot the Fork',
            content: 'A knight attacks the king AND the rook at the same time. This is a…',
            choices: [
              { text: 'Pin', correct: false },
              { text: 'Fork', correct: true },
              { text: 'Skewer', correct: false },
              { text: 'Discovered attack', correct: false },
            ],
          },
        ],
      },
      {
        id: 'tactics-2',
        unitId: 'tactics',
        title: 'The Pin',
        description: 'Nail a piece to a more valuable one behind it',
        xpReward: 30,
        steps: [
          {
            type: 'text',
            title: 'What is a Pin?',
            content: 'A **pin** happens when a piece cannot move because it would expose a more valuable piece behind it. A piece pinned against the **king** (absolute pin) literally cannot move — it would be illegal!',
          },
          {
            type: 'board',
            title: 'Absolute Pin',
            content: 'The white bishop on b3 pins the black knight on d5 against the black king on f7. The knight cannot legally move!',
            fen: '8/5k2/8/3n4/8/1B6/8/8 w - - 0 1',
            arrows: [{ from: 'b3', to: 'f7', color: '#FF4B4B' }],
          },
        ],
      },
      {
        id: 'tactics-3',
        unitId: 'tactics',
        title: 'The Skewer',
        description: 'Attack a valuable piece to win what hides behind it',
        xpReward: 30,
        steps: [
          {
            type: 'text',
            title: 'What is a Skewer?',
            content: 'A **skewer** is like a reverse pin — a valuable piece is attacked and forced to move, exposing a less valuable piece behind it. Attack the king to win the queen!',
          },
        ],
      },
      {
        id: 'tactics-4',
        unitId: 'tactics',
        title: 'Discovered Attacks',
        description: 'Unmask a hidden attacker',
        xpReward: 35,
        steps: [
          {
            type: 'text',
            title: 'Discovered Attack',
            content: 'When you move one piece and it **reveals** an attack by another piece behind it, that is a **discovered attack**. If the revealed piece attacks the king, it is a **discovered check** — extremely dangerous!',
          },
        ],
      },
    ],
  },
  {
    id: 'openings',
    title: 'Opening Principles',
    description: 'Control the center and develop your pieces',
    icon: '🏰',
    color: '#CE82FF',
    level: 4,
    requiredXP: 450,
    lessons: [
      {
        id: 'openings-1',
        unitId: 'openings',
        title: 'Control the Center',
        description: 'The most important opening rule',
        xpReward: 30,
        steps: [
          {
            type: 'text',
            title: 'Why the Center?',
            content: 'Pieces in the **center** (d4, e4, d5, e5) control more squares and have more mobility. The player who controls the center usually controls the game. Start with 1.e4 or 1.d4!',
          },
          {
            type: 'board',
            title: 'After 1.e4 e5',
            content: 'Both sides immediately contest the center. Notice how both pawns control the squares d5, f5 (white) and d4, f4 (black).',
            fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
            highlightSquares: ['d4', 'e4', 'd5', 'e5'],
          },
        ],
      },
      {
        id: 'openings-2',
        unitId: 'openings',
        title: 'Develop Your Pieces',
        description: 'Get your pieces off the back rank',
        xpReward: 30,
        steps: [
          {
            type: 'text',
            title: 'The Development Rule',
            content: 'Move each piece **once** in the opening and get them to active squares. Prioritize knights before bishops. Don\'t move the same piece twice unless there is a good reason!',
          },
          {
            type: 'quiz',
            title: 'Opening Move',
            content: 'After 1.e4 e5, what is the best next move for White?',
            choices: [
              { text: '2. Qh5 (queen attack early)', correct: false },
              { text: '2. Nf3 (develop a knight)', correct: true },
              { text: '2. h3 (a waiting move)', correct: false },
              { text: '2. a4 (expand on the wing)', correct: false },
            ],
          },
        ],
      },
      {
        id: 'openings-3',
        unitId: 'openings',
        title: 'Castle Early',
        description: 'King safety is paramount',
        xpReward: 35,
        steps: [
          {
            type: 'text',
            title: 'Castling',
            content: '**Castle** in the first 10 moves whenever possible. Castling moves your king to safety behind a wall of pawns and connects your rooks. The king is vulnerable in the center during the opening!',
          },
        ],
      },
    ],
  },
  {
    id: 'endgames',
    title: 'Endgame Essentials',
    description: 'Win won positions — king, pawns, and basic checkmates',
    icon: '👑',
    color: '#FFD700',
    level: 5,
    requiredXP: 700,
    lessons: [
      {
        id: 'endgames-1',
        unitId: 'endgames',
        title: 'King Activity',
        description: 'The king becomes a fighter in the endgame',
        xpReward: 35,
        steps: [
          {
            type: 'text',
            title: 'Activate Your King',
            content: 'In the endgame, the king transitions from hiding to fighting. An **active king** is one of the strongest pieces in a pawn endgame — march it to the center!',
          },
        ],
      },
      {
        id: 'endgames-2',
        unitId: 'endgames',
        title: 'Passed Pawns',
        description: 'The secret weapon of the endgame',
        xpReward: 35,
        steps: [
          {
            type: 'text',
            title: 'Passed Pawns',
            content: 'A **passed pawn** has no enemy pawns on its file or adjacent files blocking its path to promotion. Passed pawns must be pushed — they threaten to become queens!',
          },
          {
            type: 'board',
            title: 'Passed Pawn on e5',
            content: 'The white pawn on e5 is passed — no black pawns can stop it from queening.',
            fen: '4k3/8/8/4P3/8/8/8/4K3 w - - 0 1',
            highlightSquares: ['e6', 'e7', 'e8'],
            arrows: [{ from: 'e5', to: 'e8', color: '#FFD700' }],
          },
        ],
      },
      {
        id: 'endgames-3',
        unitId: 'endgames',
        title: 'King and Pawn vs King',
        description: 'The most fundamental endgame',
        xpReward: 40,
        steps: [
          {
            type: 'text',
            title: 'Opposition',
            content: 'When two kings face each other with one square between them, they are in **opposition**. The player who does NOT have the move has the opposition — a key advantage in pawn endgames.',
          },
        ],
      },
    ],
  },
  {
    id: 'strategy',
    title: 'Strategic Thinking',
    description: 'Plans, pawn structure, weak squares, and more',
    icon: '🧠',
    color: '#FF4B4B',
    level: 6,
    requiredXP: 1000,
    lessons: [
      {
        id: 'strategy-1',
        unitId: 'strategy',
        title: 'Pawn Structures',
        description: 'The skeleton of your position',
        xpReward: 40,
        steps: [
          {
            type: 'text',
            title: 'Pawn Structure',
            content: 'Pawns cannot move backward — their structure is permanent. **Doubled pawns** (two on the same file) are weak. **Isolated pawns** (no friendly pawns on adjacent files) can be targets. **Connected pawns** support each other and are strong.',
          },
        ],
      },
      {
        id: 'strategy-2',
        unitId: 'strategy',
        title: 'Weak Squares',
        description: 'Holes in your pawn structure',
        xpReward: 40,
        steps: [
          {
            type: 'text',
            title: 'Outposts and Holes',
            content: 'A **weak square** or **hole** is one that cannot be defended by a pawn. If your opponent has a piece there that cannot be chased away, it is called an **outpost** — a long-term strategic advantage.',
          },
        ],
      },
    ],
  },
];

export const PUZZLE_THEMES = [
  { id: 'mateIn1', label: 'Mate in 1', icon: '💀', color: '#FF4B4B' },
  { id: 'mateIn2', label: 'Mate in 2', icon: '💀', color: '#FF4B4B' },
  { id: 'fork', label: 'Fork', icon: '⚔️', color: '#FF9600' },
  { id: 'pin', label: 'Pin', icon: '📌', color: '#CE82FF' },
  { id: 'skewer', label: 'Skewer', icon: '🗡️', color: '#1CB0F6' },
  { id: 'discoveredAttack', label: 'Discovery', icon: '💥', color: '#58CC02' },
  { id: 'hangingPiece', label: 'Hanging Piece', icon: '🎯', color: '#FFD700' },
  { id: 'endgame', label: 'Endgame', icon: '👑', color: '#58CC02' },
];

export const XP_PER_LEVEL = 200;
export const MAX_HEARTS = 5;
export const HEART_REGEN_HOURS = 4;
export const DAILY_XP_GOAL = 100;

export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXPProgressInLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function getXPToNextLevel(xp: number): number {
  return XP_PER_LEVEL - getXPProgressInLevel(xp);
}
