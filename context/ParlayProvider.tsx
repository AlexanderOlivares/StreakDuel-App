import { IPick, ParlayWithPicksAndOdds, PickHistory } from "@/lib/types/interfaces";
import { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";

export interface ParlayState {
  parlays: ParlayWithPicksAndOdds[]; // high scores for broken streaks can be calculated form this
  pickHistory: PickHistory[]; // previous picks that have outcomes, used to keep finished matchups checked in UI
  dbPickHistory: PickHistory[];
  activePicks: IPick[];
  dbActivePicks: IPick[];
  activePoints: number;
  locked: boolean;
}

export const defaultState: ParlayState = {
  parlays: [],
  pickHistory: [],
  dbPickHistory: [],
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
        dbPickHistory: payload.pickHistory,
        activePoints: payload.activePoints,
        dbActivePicks: payload.activePicks,
        activePicks: payload.activePicks,
        locked: payload.locked,
      };
    case "addActivePick":
      return {
        ...state,
        activePicks: payload.activePicks,
        pickHistory: payload.pickHistory,
      };
    case "removeActivePick":
      return {
        ...state,
        activePicks: payload.activePicks,
        pickHistory: payload.pickHistory,
      };
    case "toggleUseLatestOdds":
      return {
        ...state,
        activePicks: payload.activePicks,
      };
    case "upsertParlaySuccess":
      return {
        ...state,
        dbActivePicks: payload.dbActivePicks,
        dbPickHistory: payload.dbPickHistory,
      };
    case "logout":
      return defaultState;
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
  // console.log(context.state);
  return context;
}
