"use client";

import { useState } from "react";
import { PALETTE, type PaletteItem } from "@/lib/palette";

interface Props {
  onInsert: (item: PaletteItem) => void;
}

export default function SymbolPalette({ onInsert }: Props) {
  const [category, setCategory] = useState(0);

  return (
    <div className="palette">
      <select
        className="palette-select"
        value={category}
        onChange={(e) => setCategory(Number(e.target.value))}
        aria-label="記号カテゴリ"
      >
        {PALETTE.map((cat, i) => (
          <option key={cat.name} value={i}>
            {cat.name}
          </option>
        ))}
      </select>
      <div className="palette-items">
        {PALETTE[category].items.map((item) => (
          <button
            key={item.insert}
            className="palette-btn"
            title={item.insert.trim()}
            // mousedown で preventDefault し、textarea のフォーカス/カーソルを維持する
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onInsert(item)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
