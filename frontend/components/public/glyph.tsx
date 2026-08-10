import { cn } from "@/lib/utils";

/**
 * 迷你 3x3 棋盤貼紙：用黑/白棋子組成 9 宮格圖案，當作圖示用。
 * 比 emoji 更貼合圍棋教室品牌，又能保持童趣。
 *
 * pattern: 9 字元，b=黑子、w=白子、.=空
 */
export function StoneTile({
  pattern,
  className,
}: {
  pattern: string;
  className?: string;
}) {
  const chars = pattern.padEnd(9, ".").slice(0, 9).split("");
  return (
    <span
      className={cn("grid grid-cols-3 gap-[3px] p-0.5", className)}
      aria-hidden
    >
      {chars.map((c, i) => (
        <span
          key={i}
          className={cn(
            "block h-2.5 w-2.5 rounded-full",
            c === "b" && "bg-ink",
            c === "w" && "border border-ink/40 bg-white",
            c === "." && "bg-transparent",
          )}
        />
      ))}
    </span>
  );
}

/** 棋盤貼紙圖樣庫 — 為每個區塊指定一個固定圖案，老師後台 icon 欄位可填 key。 */
export const TILE_PATTERNS: Record<string, string> = {
  // 純黑子 / 純白子
  black: "...b....b",
  white: "...w....w",
  // 對峙
  pair: "b..w...b.",
  // 圍住
  enclose: ".w.wbw.w.",
  // 雙活
  twin: "bw.....bw",
  // 散點
  scatter: "b...w...b",
  // 角星
  hoshi: "b.w.b.w.b",
  // 連子
  line: "bbb......",
  // 跳子
  jump: "b.b.b.b.b",
  // 拐子
  knight: ".bw..b.b.",
  // 三三
  sansan: "w.....b.w",
  // 模樣
  shape: "ww.bb.ww.",
};

export function patternFor(key: string | null | undefined, fallbackIdx: number): string {
  if (key && TILE_PATTERNS[key]) return TILE_PATTERNS[key];
  const keys = Object.keys(TILE_PATTERNS);
  return TILE_PATTERNS[keys[fallbackIdx % keys.length]];
}

/** 編號徽章：給「步驟」、「FAQ 編號」用。 */
export function NumberStamp({
  n,
  className,
}: {
  n: number | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-grid h-9 w-9 -rotate-6 place-items-center rounded-xl bg-ink font-display text-sm font-bold text-cream-100 shadow-pop-sm",
        className,
      )}
    >
      {typeof n === "number" ? String(n).padStart(2, "0") : n}
    </span>
  );
}

/** 小型線條 SVG 圖示集（克制使用，僅 nav / footer / 連結尾巴） */
type GlyphName = "arrow" | "phone" | "pin" | "clock" | "menu" | "spark";

export function Glyph({
  name,
  className,
  size = 18,
}: {
  name: GlyphName;
  className?: string;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: cn("inline-block shrink-0", className),
    "aria-hidden": true,
  };
  switch (name) {
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M12 2l1.6 6.8L20 10l-6.4 1.2L12 18l-1.6-6.8L4 10l6.4-1.2z" />
        </svg>
      );
  }
}

/** 棋盤一角的「裝飾性」浮動星點：用 ● ○ 拼成五個位置，純裝飾。 */
export function HoshiCluster({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block", className)} aria-hidden>
      <span className="absolute left-0 top-0 h-2 w-2 rounded-full bg-ink" />
      <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-ink" />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-ink" />
      <span className="absolute bottom-0 left-0 h-2 w-2 rounded-full bg-ink" />
      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-ink" />
    </span>
  );
}
