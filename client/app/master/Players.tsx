// src/Players.tsx
import React from "react";
import type { Client } from "../types";

interface PlayersProps {
  players: Client[];
}

const Players: React.FC<PlayersProps> = ({ players }) => {
  return (
    <div className="w-64 bg-gray-700 text-white p-4">
      <h2 className="text-lg font-bold mb-4">Players</h2>
      <ul>
        {players.map((player) => (
          <li key={player.id} className="p-2 border-b border-gray-600">
            <div className="flex justify-between">
              <span>{player.name}</span>
              <span className={`px-2 py-1 rounded bg-green-500`}>
                {player.score}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Players;
