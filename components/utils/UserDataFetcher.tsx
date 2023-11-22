import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useParlayContext } from "@/app/context/ParlayProvider";

async function getParlays() {
  const response = await axios.get("/api/parlay");
  return response.data;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface GetParlaysQuery {
  // TODO make interface
  parlays: any[];
  pickHistory: any[];
  activePoints: number;
  activePicks: any[];
  dbActivePicks: any[];
  locked: boolean;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function UserDataFetcher() {
  const parlayContext = useParlayContext();
  const { data } = useQuery<GetParlaysQuery>(["getParlays"], getParlays, { staleTime: 0 });

  // TODO improve this
  if (data && parlayContext.state.parlays !== data?.parlays) {
    parlayContext.dispatch({
      type: "fetchParlays",
      payload: data,
    });
  }
  return <></>;
}

export default UserDataFetcher;
