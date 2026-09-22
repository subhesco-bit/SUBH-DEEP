import { BODY_PARTS, BODY_VIEW, millTone, type BodyFacts, type BodyPartId } from "@/lib/body";
import { cn } from "@/lib/utils";

function strokeFor(id: BodyPartId, selected: BodyPartId | null, mill: ReturnType<typeof millTone>) {
  if (selected === id) return "var(--color-foreground)";
  if (id === "muscle" || id === "relax") {
    if (mill === "resting") return "var(--color-partial)";
    if (mill === "contracted") return "var(--color-live)";
  }
  const row = BODY_PARTS.find((p) => p.id === id);
  if (row?.status === "living") return "var(--color-live)";
  if (row?.status === "partial") return "var(--color-partial)";
  return "var(--color-gap)";
}

export function BodyFigure({
  selected,
  facts,
  onSelect,
}: {
  selected: BodyPartId | null;
  facts: BodyFacts;
  onSelect: (id: BodyPartId) => void;
}) {
  const mill = millTone(facts);
  const resting = mill === "resting";

  return (
    <svg
      viewBox={`0 0 ${BODY_VIEW.w} ${BODY_VIEW.h}`}
      role="img"
      aria-label="Human-equivalent body of the rural economic organism"
      className="mx-auto h-auto w-full max-w-[280px]"
    >
      <title>AFRERA body plate</title>
      {/* Skin — outer barrier */}
      <path
        d="M120 18
           C 86 18, 72 36, 72 52
           C 72 64, 78 72, 84 78
           L 78 112
           C 48 128, 36 168, 38 214
           L 32 268
           C 28 286, 22 292, 18 304
           L 22 312
           C 36 300, 48 280, 52 262
           L 62 214
           L 70 248
           C 74 310, 70 370, 78 428
           L 72 468
           C 70 478, 78 482, 90 480
           L 102 478
           L 108 430
           L 120 430
           L 132 430
           L 138 478
           L 150 480
           C 162 482, 170 478, 168 468
           L 162 428
           C 170 370, 166 310, 170 248
           L 178 214
           L 188 262
           C 192 280, 204 300, 218 312
           L 222 304
           C 218 292, 212 286, 208 268
           L 202 214
           C 204 168, 192 128, 162 112
           L 156 78
           C 162 72, 168 64, 168 52
           C 168 36, 154 18, 120 18 Z"
        fill="color-mix(in oklab, var(--color-foreground) 4%, transparent)"
        stroke={strokeFor("skin", selected, mill)}
        strokeWidth={selected === "skin" ? 2.2 : 1.15}
        className="cursor-pointer transition-[stroke,stroke-width] duration-200"
        onClick={() => onSelect("skin")}
        data-qa="body-part-skin"
      />

      {/* Head */}
      <circle cx="120" cy="48" r="22" fill="var(--color-surface)" stroke="var(--color-foreground)" strokeWidth="1.2" />

      {/* Eyes */}
      <circle
        cx="112"
        cy="46"
        r="3.2"
        fill={selected === "eye" ? "var(--color-foreground)" : "var(--color-live)"}
        className="cursor-pointer"
        onClick={() => onSelect("eye")}
        data-qa="body-part-eye"
      />
      <circle
        cx="128"
        cy="46"
        r="3.2"
        fill={selected === "eye" ? "var(--color-foreground)" : "var(--color-live)"}
        className="cursor-pointer"
        onClick={() => onSelect("eye")}
      />

      {/* Ears */}
      <path
        d="M96 48 C 90 42, 88 54, 96 56"
        fill="none"
        stroke={strokeFor("ear", selected, mill)}
        strokeWidth={selected === "ear" ? 2.4 : 1.4}
        className="cursor-pointer"
        onClick={() => onSelect("ear")}
        data-qa="body-part-ear"
      />
      <path
        d="M144 48 C 150 42, 152 54, 144 56"
        fill="none"
        stroke={strokeFor("ear", selected, mill)}
        strokeWidth={selected === "ear" ? 2.4 : 1.4}
        className="cursor-pointer"
        onClick={() => onSelect("ear")}
      />

      {/* Spine */}
      <path
        d="M120 72 L 120 210"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="1"
        strokeDasharray="3 4"
      />

      {/* Ligaments — dashed joints */}
      <g
        className="cursor-pointer"
        onClick={() => onSelect("ligament")}
        data-qa="body-part-ligament"
        stroke={strokeFor("ligament", selected, mill)}
        strokeWidth={selected === "ligament" ? 2 : 1.15}
        fill="none"
        strokeDasharray="3 3"
      >
        <path d="M88 118 L 120 128 L 152 118" />
        <path d="M96 248 L 120 240 L 144 248" />
        <path d="M96 360 L 108 352" />
        <path d="M144 360 L 132 352" />
      </g>

      {/* Muscle — arms */}
      <g
        className="cursor-pointer"
        onClick={() => onSelect("muscle")}
        data-qa="body-part-muscle"
        stroke={strokeFor("muscle", selected, mill)}
        strokeWidth={resting ? 2.2 : 3.4}
        fill="none"
        strokeLinecap="round"
        opacity={resting ? 0.55 : 1}
      >
        <path d="M88 128 C 64 148, 52 190, 42 250" />
        <path d="M152 128 C 176 148, 188 190, 198 250" />
      </g>

      {/* Veins — remaining paths from heart */}
      <g
        className="cursor-pointer"
        onClick={() => onSelect("vein")}
        data-qa="body-part-vein"
        stroke={strokeFor("vein", selected, mill)}
        strokeWidth="1"
        fill="none"
      >
        <path d="M128 138 C 150 150, 168 168, 188 220" />
        <path d="M128 138 C 110 160, 108 210, 108 300 C 108 360, 100 420, 96 460" />
        <path d="M128 138 C 140 160, 136 210, 132 300 C 132 360, 140 420, 144 460" />
        <path d="M128 138 C 100 150, 72 168, 52 220" />
      </g>

      {/* Heart */}
      <path
        d="M128 128
           C 122 118, 108 120, 108 132
           C 108 146, 128 158, 128 158
           C 128 158, 148 146, 148 132
           C 148 120, 134 118, 128 128 Z"
        fill={selected === "heart" ? "var(--color-foreground)" : "var(--color-live)"}
        className="cursor-pointer"
        onClick={() => onSelect("heart")}
        data-qa="body-part-heart"
        opacity={0.9}
      />

      {/* Relax — solar plexus rest */}
      <circle
        cx="120"
        cy="210"
        r={resting ? 11 : 8}
        fill="color-mix(in oklab, var(--color-partial) 18%, transparent)"
        stroke={strokeFor("relax", selected, mill)}
        strokeWidth={selected === "relax" ? 2 : 1.2}
        className="cursor-pointer transition-[r,stroke] duration-200"
        onClick={() => onSelect("relax")}
        data-qa="body-part-relax"
      />

      {/* Hands */}
      <g className="cursor-pointer" onClick={() => onSelect("hand")} data-qa="body-part-hand">
        <ellipse
          cx="40"
          cy="268"
          rx="10"
          ry="8"
          fill="var(--color-surface)"
          stroke={strokeFor("hand", selected, mill)}
          strokeWidth={selected === "hand" ? 2 : 1.2}
        />
        <ellipse
          cx="200"
          cy="268"
          rx="10"
          ry="8"
          fill="var(--color-surface)"
          stroke={strokeFor("hand", selected, mill)}
          strokeWidth={selected === "hand" ? 2 : 1.2}
        />
      </g>

      {/* Fingers */}
      <g
        className="cursor-pointer"
        onClick={() => onSelect("finger")}
        data-qa="body-part-finger"
        stroke={strokeFor("finger", selected, mill)}
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M32 262 L 24 250" />
        <path d="M34 266 L 22 260" />
        <path d="M36 272 L 24 276" />
        <path d="M38 278 L 28 286" />
        <path d="M208 262 L 216 250" />
        <path d="M206 266 L 218 260" />
        <path d="M204 272 L 216 276" />
        <path d="M202 278 L 212 286" />
      </g>

      {/* Legs */}
      <path
        d="M104 248 C 98 310, 96 380, 96 460"
        fill="none"
        stroke="var(--color-foreground)"
        strokeWidth="1.3"
        opacity="0.55"
      />
      <path
        d="M136 248 C 142 310, 144 380, 144 460"
        fill="none"
        stroke="var(--color-foreground)"
        strokeWidth="1.3"
        opacity="0.55"
      />

      {/* Feet */}
      <g className="cursor-pointer" onClick={() => onSelect("feet")} data-qa="body-part-feet">
        <ellipse
          cx="94"
          cy="472"
          rx="18"
          ry="7"
          fill="var(--color-surface)"
          stroke={strokeFor("feet", selected, mill)}
          strokeWidth={selected === "feet" ? 2 : 1.2}
        />
        <ellipse
          cx="146"
          cy="472"
          rx="18"
          ry="7"
          fill="var(--color-surface)"
          stroke={strokeFor("feet", selected, mill)}
          strokeWidth={selected === "feet" ? 2 : 1.2}
        />
      </g>

      {/* Hotspot rings for hit-area clarity */}
      {BODY_PARTS.map((p) => (
        <circle
          key={p.id}
          cx={p.cx}
          cy={p.cy}
          r={selected === p.id ? 14 : 11}
          fill="transparent"
          stroke={selected === p.id ? "var(--color-foreground)" : "transparent"}
          strokeWidth="0.6"
          className="cursor-pointer"
          onClick={() => onSelect(p.id)}
        >
          <title>{p.name}</title>
        </circle>
      ))}

      <text
        x="120"
        y="494"
        textAnchor="middle"
        fill="var(--color-muted)"
        fontSize="8"
        fontFamily="var(--font-mono)"
        letterSpacing="0.16em"
      >
        {resting ? "MUSCLE RESTING · EMI NOT FROZEN" : "MUSCLE MAY CONTRACT · CLERK WRITES"}
      </text>
    </svg>
  );
}

export function BodyHotspots({
  selected,
  onSelect,
}: {
  selected: BodyPartId | null;
  onSelect: (id: BodyPartId) => void;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {BODY_PARTS.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            data-qa={`body-chip-${p.id}`}
            onClick={() => onSelect(p.id)}
            className={cn(
              "h-11 rounded-md border px-3 text-sm transition-[color,background-color,border-color] duration-150",
              selected === p.id
                ? "border-foreground bg-accent text-foreground"
                : "border-border text-muted hover:text-foreground",
            )}
          >
            {p.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
