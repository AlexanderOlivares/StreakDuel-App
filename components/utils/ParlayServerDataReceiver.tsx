"use client";

import { useParlayContext } from "@/context/ParlayProvider";
import { GetParlays } from "@/app/dataFetching/getParlays";

interface UserDataFetcherProps {
  parlays: GetParlays;
}

function ParlayServerDataReceiver({ parlays: dbParlays }: UserDataFetcherProps) {
  const parlayContext = useParlayContext();
  const { parlays } = dbParlays;

  // TODO improve this
  if (parlayContext.state.parlays !== parlays) {
    parlayContext.dispatch({
      type: "fetchParlays",
      payload: dbParlays,
    });
  }
  return <></>;
}

export default ParlayServerDataReceiver;
