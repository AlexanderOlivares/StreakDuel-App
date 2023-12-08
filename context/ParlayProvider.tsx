import { IPick, ParlayWithPicksAndOdds } from "@/lib/types/interfaces";
import { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";

export interface ParlayState {
  parlays: ParlayWithPicksAndOdds[]; // high scores for broken streaks can be calculated form this
  pickHistory: IPick[]; // previous picks that have outcomes, used to keep finished matchups checked in UI
  activePicks: IPick[];
  dbActivePicks: IPick[];
  activePoints: number;
  locked: boolean;
}

const defaultState: ParlayState = {
  parlays: [],
  pickHistory: [],
  activePicks: [],
  dbActivePicks: [],
  activePoints: 100,
  locked: false,
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
        parlays: payload.parlays,
        pickHistory: payload.pickHistory,
        activePoints: payload.activePoints,
        dbActivePicks: payload.activePicks,
        activePicks: payload.activePicks,
        locked: payload.locked,
      };
    case "addActivePick":
      return {
        ...state,
        activePicks: payload.activePicks,
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
