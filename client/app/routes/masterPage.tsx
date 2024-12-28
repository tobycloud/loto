import type { Route } from "./+types/home";
import { Master } from "../master/master";
import { useContext } from "react";
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
  return <Master />;
}
