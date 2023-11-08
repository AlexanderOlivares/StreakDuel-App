import axios from "axios";
import { useQuery } from "@tanstack/react-query";

async function getParlays() {
  const response = await axios.get("/api/parlay");
  return response.data;
}

interface GetParlaysQuery {
  // TODO make interface
  parlays: any[];
  message: string;
}

export default function useUserQuery() {
  return useQuery<GetParlaysQuery>(["getParlays"], getParlays);
}
