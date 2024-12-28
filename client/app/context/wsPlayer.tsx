import React from "react";
import { redirect } from "react-router";
import { stateContext } from "./states";
import type { IPlayer } from "../types";

export interface IWsPlayerContext {
  ws: WebSocket;
  status: string;
  players: IPlayer[];
}

export const wsPlayerContext = React.createContext<IWsPlayerContext>(
  {} as IWsPlayerContext
);

export function WsPlayerProvider({ children }: { children: React.ReactNode }) {
  const {
    state: { roomId: rootId },
  } = React.useContext(stateContext);
  const [players, setPlayers] = React.useState<IPlayer[]>([]);
  const [status, setStatus] = React.useState("active");
  const ws = new WebSocket(
    `ws://localhost:3000/room/${rootId}`
  );
  ws.close = () => {
    redirect("/");
  };
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (!data.type) {
      return;
    }
    switch (data.type) {
      case "init":
        setStatus(data.data.status);
        setPlayers(data.message.data.clients);
        break;
      default:
        console.log(e.data);
        break;
    }
  };
  return (
    <wsPlayerContext.Provider value={{ ws, status, players }}>
      {children}
    </wsPlayerContext.Provider>
  );
}
