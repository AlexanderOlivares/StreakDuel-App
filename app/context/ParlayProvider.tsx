import { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";

export interface ParlayState {
  message: string;
  parlays: any[];
}

const defaultState: ParlayState = {
  message: "",
  parlays: [],
};

export type ParlayAction = {
  type: string;
  payload: ParlayState;
};

type Dispatch = (action: ParlayAction) => void;

interface ParlayContext {
  state: ParlayState;
  dispatch: Dispatch;
}

const ParlayContext = createContext<ParlayContext | undefined>(undefined);

function parlayContextReducer(state: ParlayState, action: ParlayAction): ParlayState {
  const { type, payload } = action;
  switch (type) {
    case "fetchParlays":
      return {
        message: payload.message,
        parlays: payload.parlays,
      };
    default:
      return state;
  }
}

export function ParlayContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(parlayContextReducer, defaultState);
  return <ParlayContext.Provider value={{ state, dispatch }}>{children}</ParlayContext.Provider>;
}

export function useParlayContext() {
  const context = useContext(ParlayContext);
  if (!context) throw new Error("no parlay context found");
  return context;
}
