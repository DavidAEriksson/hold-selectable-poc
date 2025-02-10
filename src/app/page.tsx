"use client";
import { useState, useEffect, MouseEvent } from "react";

type Block = {
  x: number;
  y: number;
  zone: 1 | 2;
};

export default function Home() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const ZONE1_LIMIT = 10;
  const ZONE2_LIMIT = 20;

  const getZone = (x: number): 1 | 2 => {
    if (x >= 20 && x < 80) return 2;
    return 1;
  };

  const countBlocksInZone = (zone: 1 | 2) => {
    return blocks.filter((block) => block.zone === zone).length;
  };

  const handleMouseDown = (x: number, y: number, isRightClick: boolean) => {
    if (isRightClick) {
      setBlocks((prev) =>
        prev.filter((block) => !(block.x === x && block.y === y)),
      );
      return;
    }

    const zone = getZone(x);
    const zoneCount = countBlocksInZone(zone);

    if (
      (zone === 1 && zoneCount >= ZONE1_LIMIT) ||
      (zone === 2 && zoneCount >= ZONE2_LIMIT)
    ) {
      return;
    }

    setIsDrawing(true);
    const exists = blocks.some((block) => block.x === x && block.y === y);
    if (!exists) {
      setBlocks((prev) => [...prev, { x, y, zone }]);
    }
  };

  const handleMouseOver = (x: number, y: number) => {
    if (!isDrawing) return;

    const zone = getZone(x);
    const zoneCount = countBlocksInZone(zone);

    if ((zone === 1 && zoneCount >= 10) || (zone === 2 && zoneCount >= 20)) {
      return;
    }

    const exists = blocks.some((block) => block.x === x && block.y === y);
    if (!exists) {
      setBlocks((prev) => [...prev, { x, y, zone }]);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDrawing(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="text-sm flex justify-between items-center bg-gray-100 p-4 rounded-lg">
        <div>
          <span className="font-semibold text-black">Zone 1 (Sides):</span>{" "}
          <span className="text-black">
            {countBlocksInZone(1)}/{ZONE1_LIMIT} blocks{" "}
          </span>
          <span className="ml-2 text-green-600">
            ({ZONE1_LIMIT - countBlocksInZone(1)} remaining)
          </span>
        </div>
        <div>
          <span className="font-semibold text-black">Zone 2 (Middle):</span>{" "}
          <span className="text-black">
            {countBlocksInZone(2)}/{ZONE2_LIMIT} blocks{" "}
          </span>
          <span className="ml-2 text-green-600">
            ({ZONE2_LIMIT - countBlocksInZone(2)} remaining)
          </span>
        </div>
        <button
          onClick={() => setBlocks([])}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md transition-colors"
        >
          Reset Grid
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-[1000px]">
        <div className="text-sm">
          Zone 1: {countBlocksInZone(1)}/10 blocks | Zone 2:{" "}
          {countBlocksInZone(2)}/20 blocks
        </div>
        <div
          className="grid w-full aspect-[2/1] bg-gray-100 border border-gray-300"
          style={{
            gridTemplateColumns: "repeat(100, 1fr)",
            gridTemplateRows: "repeat(50, 1fr)",
          }}
          onMouseLeave={() => setIsDrawing(false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          {Array.from({ length: 50 }, (_, y) =>
            Array.from({ length: 100 }, (_, x) => {
              const isZone2 = x >= 20 && x < 80;
              return (
                <div
                  key={`${x}-${y}`}
                  className={`
                    border border-gray-200
                    ${
                      blocks.some((block) => block.x === x && block.y === y)
                        ? "bg-blue-500"
                        : isZone2
                        ? "bg-gray-50"
                        : ""
                    }
                  `}
                  onMouseDown={(e) => handleMouseDown(x, y, e.button === 2)}
                  onMouseOver={() => handleMouseOver(x, y)}
                  onMouseUp={handleMouseUp}
                />
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
