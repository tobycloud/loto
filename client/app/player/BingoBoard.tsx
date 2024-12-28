// src/components/BingoBoard.tsx
import React from "react";

export interface BingoBoardProps {
  board: { value: number; marked: boolean }[];
  onNumberClick: (index: number) => void;
}

const BingoBoard: React.FC<BingoBoardProps> = ({ board, onNumberClick }) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {board.map((number, index) => (
        <div
          key={index}
          onClick={() => onNumberClick(index)}
          className={`border p-4 text-center ${
            number.marked ? "bg-green-500" : "bg-white"
          }`}
        >
          {number.value}
        </div>
      ))}
    </div>
  );
};

export default BingoBoard;
