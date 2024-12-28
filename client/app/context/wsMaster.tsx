import React from "react";
import { redirect } from "react-router";
import { stateContext } from "./states";
import type { IPlayer } from "../types";

export interface IWsMasterContext {
  ws: WebSocket;
  status: string;
  players: IPlayer[];
}

export const wsMasterContext = React.createContext<IWsMasterContext>(
  {} as IWsMasterContext
);

export function WsMasterProvider({ children }: { children: React.ReactNode }) {
  const {
    state: { masterKey, roomId: rootId },
  } = React.useContext(stateContext);
  const [players, setPlayers] = React.useState<IPlayer[]>([]);
  const [status, setStatus] = React.useState("active");
  const ws = new WebSocket(
    `ws://localhost:3000/room/master/${rootId}/${masterKey}`
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
    <wsMasterContext.Provider value={{ ws, status, players }}>
      {children}
    </wsMasterContext.Provider>
  );
}
