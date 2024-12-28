import React from "react";

interface State {
  masterKey?: string;
  roomId?: string;
}

export const stateContext = React.createContext<{
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
}>({
  state: {},
  setState: (a: React.SetStateAction<State>) => {},
});

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState({});
  return (
    <stateContext.Provider value={{ state, setState }}>
      {children}
    </stateContext.Provider>
  );
}
