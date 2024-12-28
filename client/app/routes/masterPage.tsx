import type { Route } from "./+types/home";
import { Master } from "../master/master";
import { useContext } from "react";
import { stateContext } from "../context/states";
import { redirect } from "react-router";
import { WsMasterProvider } from "../context/wsMaster";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function MasterPage() {
  const {
    state: { masterKey, roomId: rootId },
  } = useContext(stateContext);
  if (!masterKey || !rootId) {
    console.log("no master key");
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return;
  }

  return (
    <WsMasterProvider>
      <Master />
    </WsMasterProvider>
  );
}
