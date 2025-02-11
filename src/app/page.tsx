"use client";
import { useState, useEffect, MouseEvent } from "react";
import PurchaseModal from "./components/modal";

type Block = {
  x: number;
  y: number;
  zone: 1 | 2;
};

type BlockInventory = {
  zone1Blocks: number;
  zone2Blocks: number;
};

export default function Home() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inventory, setInventory] = useState<BlockInventory>({
    zone1Blocks: 0,
    zone2Blocks: 0,
  });
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<1 | 2>(1);

  const purchaseBlocks = (zone: 1 | 2) => {
    setInventory((prev) => ({
      ...prev,
      [zone === 1 ? "zone1Blocks" : "zone2Blocks"]:
        prev[zone === 1 ? "zone1Blocks" : "zone2Blocks"] + 10,
    }));
  };

  const getZone = (x: number): 1 | 2 => {
    if (x >= 20 && x < 80) return 2;
    return 1;
  };

  const countBlocksInZone = (zone: 1 | 2) => {
    return blocks.filter((block) => block.zone === zone).length;
  };

  const handleMouseDown = (x: number, y: number, isRightClick: boolean) => {
    if (isRightClick) {
      const removedBlock = blocks.find(
        (block) => block.x === x && block.y === y,
      );
      if (removedBlock) {
        setBlocks((prev) =>
          prev.filter((block) => !(block.x === x && block.y === y)),
        );
        // Return block to inventory when removed
        setInventory((prev) => ({
          ...prev,
          [removedBlock.zone === 1 ? "zone1Blocks" : "zone2Blocks"]:
            prev[removedBlock.zone === 1 ? "zone1Blocks" : "zone2Blocks"] + 1,
        }));
      }
      return;
    }

    const zone = getZone(x);
    const inventoryKey = zone === 1 ? "zone1Blocks" : "zone2Blocks";

    // Check if user has available blocks in their inventory
    if (inventory[inventoryKey] <= 0) {
      return;
    }

    setIsDrawing(true);
    const exists = blocks.some((block) => block.x === x && block.y === y);
    if (!exists) {
      setBlocks((prev) => [...prev, { x, y, zone }]);
      // Decrease inventory when placing a block
      setInventory((prev) => ({
        ...prev,
        [inventoryKey]: prev[inventoryKey] - 1,
      }));
    }
  };

  const handleMouseOver = (x: number, y: number) => {
    if (!isDrawing) return;

    const zone = getZone(x);
    const inventoryKey = zone === 1 ? "zone1Blocks" : "zone2Blocks";

    // Check if user has available blocks in their inventory
    if (inventory[inventoryKey] <= 0) {
      return;
    }

    const exists = blocks.some((block) => block.x === x && block.y === y);
    if (!exists) {
      setBlocks((prev) => [...prev, { x, y, zone }]);
      // Decrease inventory when placing a block
      setInventory((prev) => ({
        ...prev,
        [inventoryKey]: prev[inventoryKey] - 1,
      }));
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
    <div className="grid items-center justify-items-center min-h-screen p-2 pb-2 gap-2 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="text-sm flex justify-between items-center bg-gray-100 p-4 rounded-lg">
        <div>
          <span className="font-semibold text-black">Zone 1 (Sides):</span>{" "}
          <span className="text-black">{countBlocksInZone(1)} placed</span>
          <span className="text-green-600 ml-2">
            ({inventory.zone1Blocks} available)
          </span>
        </div>
        <div>
          <span className="font-semibold text-black">Zone 2 (Middle):</span>{" "}
          <span className="text-black">{countBlocksInZone(2)} placed</span>
          <span className="text-green-600 ml-2">
            ({inventory.zone2Blocks} available)
          </span>
        </div>
        <button
          onClick={() => {
            // Return all placed blocks to inventory before clearing
            const zone1PlacedBlocks = blocks.filter(
              (block) => block.zone === 1,
            ).length;
            const zone2PlacedBlocks = blocks.filter(
              (block) => block.zone === 2,
            ).length;

            setInventory((prev) => ({
              zone1Blocks: prev.zone1Blocks + zone1PlacedBlocks,
              zone2Blocks: prev.zone2Blocks + zone2PlacedBlocks,
            }));

            setBlocks([]);
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md transition-colors"
        >
          Reset Grid
        </button>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => {
            setSelectedZone(1);
            setPurchaseModalOpen(true);
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Buy 10 Blocks for Zone 1 (+10)
        </button>
        <button
          onClick={() => {
            setSelectedZone(2);
            setPurchaseModalOpen(true);
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Buy 10 Blocks for Zone 2 (+10)
        </button>
      </div>

      <PurchaseModal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        onConfirm={() => purchaseBlocks(selectedZone)}
        zone={selectedZone}
      />

      <div className="flex flex-col gap-4 w-full max-w-[1000px]">
        <div className="text-sm">
          Zone 1: {countBlocksInZone(1)} blocks | Zone 2: {countBlocksInZone(2)}{" "}
          blocks
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
