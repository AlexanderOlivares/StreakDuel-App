import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useParlayContext } from "@/app/context/ParlayProvider";

async function getParlays() {
  const response = await axios.get("/api/parlay");
  return response.data;
}

interface GetParlaysQuery {
  // TODO make interface
  parlays: any[];
  message: string;
}

function UserDataFetcher() {
  const parlayContext = useParlayContext();
  const { data } = useQuery<GetParlaysQuery>(["getParlays"], getParlays);

  console.log({
    inDataFetcher: true,
    data,
  });

  // TODO improve this
  if (data && parlayContext.state.parlays !== data?.parlays) {
    parlayContext.dispatch({
      type: "fetchParlays",
      payload: {
        message: data.message,
        parlays: data.parlays,
      },
    });
  }
  return <></>;
}

export default UserDataFetcher;
