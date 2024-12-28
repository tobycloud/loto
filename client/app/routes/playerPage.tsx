import type { Route } from "./+types/home";
import { useContext } from "react";
import { stateContext } from "../context/states";
import { redirect } from "react-router";
import { WsPlayerProvider } from "../context/wsPlayer";
import BingoGame from "../player/player";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function MasterPage() {
  const {
    state: { roomId },
  } = useContext(stateContext);
  if (!roomId) {
    console.log("no room id");
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return;
  }

  return (
    <WsPlayerProvider>
      <BingoGame />
    </WsPlayerProvider>
  );
}
