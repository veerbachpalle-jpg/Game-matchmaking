import type { Cell } from "@/lib/api";

/**
 * Cinematic 3x3 XOX board. Purely presentational — the server owns the state.
 */
export function XoxBoard({
  board,
  onPlay,
  disabled,
  winningLine,
}: {
  board: Cell[];
  onPlay: (index: number) => void;
  disabled: boolean;
  winningLine?: number[];
}) {
  return (
    <div className="[perspective:1200px]">
      <div
        className="mx-auto grid w-full max-w-sm grid-cols-3 gap-2 transition-transform duration-500"
        style={{ transform: "rotateX(12deg)", transformStyle: "preserve-3d" }}
      >
        {board.map((cell, i) => {
          const won = winningLine?.includes(i);
          const empty = cell === null;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Cell ${i + 1}${cell ? `, ${cell}` : ", empty"}`}
              disabled={disabled || !empty}
              onClick={() => onPlay(i)}
              className={`group relative grid aspect-square place-items-center border transition-all duration-200 ${
                won
                  ? "border-accent/80 bg-accent/15"
                  : "border-border/70 bg-surface/50 hover:border-primary/60"
              } ${!disabled && empty ? "cursor-pointer hover:-translate-y-1" : "cursor-default"}`}
            >
              {cell === "X" && (
                <span className="animate-rise font-display text-5xl font-bold text-primary drop-shadow-[0_0_18px_color-mix(in_oklab,var(--primary)_60%,transparent)]">
                  X
                </span>
              )}
              {cell === "O" && (
                <span className="animate-rise font-display text-5xl font-bold text-accent drop-shadow-[0_0_18px_color-mix(in_oklab,var(--accent)_60%,transparent)]">
                  O
                </span>
              )}
              {empty && !disabled && (
                <span className="h-2 w-2 rotate-45 bg-primary/0 transition-colors group-hover:bg-primary/50" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function findWinningLine(board: Cell[]): number[] | undefined {
  return LINES.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
}
