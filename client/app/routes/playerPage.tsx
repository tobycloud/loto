import type { Route } from "./+types/home";
import { useContext } from "react";
import { redirect } from "react-router";
import BingoGame from "../player/player";
import { wsContext } from "../context/ws";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function MasterPage() {
  const { roomID } = useContext(wsContext);
  if (!roomID) {
    window.location.href = "/";
    return null;
  }

  return <BingoGame />;
}
