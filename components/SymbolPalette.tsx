"use client";

import { PALETTE, type PaletteItem } from "@/lib/palette";

interface Props {
  onInsert: (item: PaletteItem) => void;
}

export default function SymbolPalette({ onInsert }: Props) {
  return (
    <div className="palette">
      {PALETTE.map((cat) => (
        <div key={cat.name} className="palette-row">
          <span className="palette-cat">{cat.name}</span>
          <div className="palette-items">
            {cat.items.map((item) => (
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
      ))}
    </div>
  );
}
