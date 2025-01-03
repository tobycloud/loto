import { useContext } from "react";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
import { redirect, useNavigate } from "react-router";
import { wsContext } from "../context/ws";
import React from "react";

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
}

export function Welcome() {
  const navigate = useNavigate();
  const { ws, setRoom } = useContext(wsContext);
  const [loading, setLoading] = React.useState(true);
  const [chooseType, setChooseType] = React.useState(false);
  const createGame = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    console.log("create game");
    e.preventDefault();
    const gameId = uuidv4();
    ws.send(JSON.stringify({ type: "create", name: gameId }));
    navigate("/master");
  };

  const joinGame = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    console.log("join game");
    e.preventDefault();
    const gameId = prompt("Enter the game ID");
    if (!gameId) return;
    const res = await fetch(`http://localhost:3000/room/${gameId}`);
    if (res.status !== 200) {
      alert("Room not found");
      return;
    }
    setRoom(await res.json());
    ws.send(JSON.stringify({ type: "join", name: gameId }));
    navigate("/player");
  };

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
            <img
              src={logoLight}
              alt="React Router"
              className="block w-full dark:hidden"
            />
            <img
              src={logoDark}
              alt="React Router"
              className="hidden w-full dark:block"
            />
          </div>
        </header>
        <div className="grid gap-8">
          <p className="text-2xl text-center">
            Welcome to your new Lotto Game!
          </p>
          {/* create and join game buttons */}
          <div className="flex items-center justify-center gap-4 mt-8 text-2xl">
            <button
              className="btn btn-primary gap-2"
              onClick={(e) => createGame(e)}
              disabled={loading}
            >
              Create Game
            </button>
            <button
              className="btn btn-secondary"
              onClick={(e) => {
                joinGame(e);
              }}
              disabled={loading}
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
