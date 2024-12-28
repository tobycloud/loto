import React, { createContext, useEffect, useState } from "react";
import type { Client, Room } from "../types";

type WsContextType = {
  ws: WebSocket;
  gameState: string | null;
  roomID: string | null;
  clients: Client[];
  setRoom(room: Room): void;
};

export const wsContext = createContext<WsContextType>({} as WsContextType);
export const WsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ws, setWs] = useState<WebSocket | null>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<string | null>(null);
  const [roomID, setRoomID] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  let retriedTimes = 0;
  if (!ws && typeof window !== "undefined") {
    setWs(new WebSocket("ws://localhost:3000/play"));
  }
  useEffect(() => {
    ws
      ? (ws.onopen = () => {
          setLoading(false);
          setError(null);
          setWs(ws);
        })
      : null;
    ws
      ? (ws.onclose = () => {
          if (retriedTimes < 5) {
            setLoading(true);
            console.log(retriedTimes);
            setTimeout(() => {
              setWs(new WebSocket("ws://localhost:3000/play"));
              retriedTimes++;
            }, 1000);
            return;
          } else {
            setLoading(false);
            setError("Connection error");
          }
        })
      : null;
    ws
      ? (ws.onerror = (err) => {
          if (retriedTimes < 5) {
            setLoading(true);
            console.log(retriedTimes);
            setTimeout(() => {
              setWs(new WebSocket("ws://localhost:3000/play"));
              retriedTimes++;
            }, 1000);
            return;
          } else {
            setLoading(false);
            setError("Connection error");
          }
        })
      : null;
    ws
      ? (ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (!data.type) return;
          if (data.type === "room+") {
            setGameState(data.status);
            setRoomID(data.roomName);
          } else if (data.type === "client+") {
            setClients((prev) => [...prev, data.data]);
          } else if (data.type === "error") {
            setServerError(data.data);
          }
        })
      : null;
    return () => {
      ws && ws.close();
    };
  }, []);

  const joinRoom = (room: Room) => {
    setRoomID(room.roomName);
    setGameState(room.status);
    setClients(room.clients);
  };

  return loading ? (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) : error || !ws ? (
    <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {" "}
      <h1 className="text-4xl font-bold mb-4">Oops!</h1>{" "}
      <p className="text-lg mb-4">
        The page you're looking for doesn't exist. {error}
      </p>{" "}
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        {" "}
        Reload{" "}
      </button>{" "}
    </div>
  ) : (
    <wsContext.Provider value={{ ws, gameState, roomID, clients, setRoom: joinRoom }}>
      {children}
    </wsContext.Provider>
  );
};
