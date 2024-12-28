// src/components/BingoGame.tsx
import React, { useState } from "react";
import BingoBoard from "./BingoBoard";

interface BoardNumber {
  value: number;
  marked: boolean;
}

const initialBoardState: BoardNumber[] = Array.from({ length: 25 }, (_, i) => ({
  value: i + 1,
  marked: false,
}));

const BingoGame: React.FC = () => {
  const [board, setBoard] = useState<BoardNumber[]>(initialBoardState);

  const handleNumberClick = (index: number) => {
    const newBoard = [...board];
    newBoard[index].marked = !newBoard[index].marked;
    setBoard(newBoard);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bingo Game</h1>
      <BingoBoard board={board} onNumberClick={handleNumberClick} />
    </div>
  );
};

export default BingoGame;
