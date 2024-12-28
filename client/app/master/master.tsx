// src/App.tsx
import React, { useContext, useState } from "react";
import Players from "./Players";
export function Master() {
  return <App></App>;
}

import "tailwindcss/tailwind.css";
import { wsMasterContext } from "../context/wsMaster";

const generateBingoNumbers = () => {
  let numbers = Array.from({ length: 75 }, (_, i) => i + 1);
  return numbers.sort(() => Math.random() - 0.5);
};

const App: React.FC = () => {
  const { players } = useContext(wsMasterContext);
  const [bingoNumbers, setBingoNumbers] = useState(generateBingoNumbers());
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);

  const callNumber = () => {
    if (bingoNumbers.length > 0) {
      const [nextNumber, ...remainingNumbers] = bingoNumbers;
      setCalledNumbers([...calledNumbers, nextNumber]);
      setBingoNumbers(remainingNumbers);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white flex">
      <Players players={players} />
      <div className="flex-1 flex flex-col items-center">
        <header className="w-full bg-gray-800 p-4 text-center text-lg font-bold">
          Bingo Master Page
        </header>
        <main className="flex flex-1 w-full p-4">
          <div className="flex-1 flex flex-col items-center bg-gray-700 rounded-lg shadow-lg p-4">
            <h2 className="text-2xl font-bold mb-4">Called Numbers</h2>
            <div className="flex flex-wrap justify-center mb-4">
              {calledNumbers.map((number) => (
                <span
                  key={number}
                  className="w-10 h-10 flex items-center justify-center m-1 bg-blue-500 rounded-full"
                >
                  {number}
                </span>
              ))}
            </div>
            <button
              className="bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 rounded"
              onClick={callNumber}
            >
              Call Next Number
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
