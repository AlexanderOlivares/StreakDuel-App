export const dynamic = "force-dynamic";
import ComponentError from "@/components/utils/ComponentError";
import MatchupBoard from "./components/matchups/MatchupBoard";
import { GetMatchups, getMatchups } from "./dataFetching/getMatchups";
import { GetParlays, getParlays } from "./dataFetching/getParlays";
import ParlayServerDataReceiver from "@/components/utils/ParlayServerDataReceiver";

export default async function App() {
  const { matchups, displayDates, error: matchupError }: GetMatchups = await getMatchups();
  const { error: parlayError, ...parlays }: GetParlays = await getParlays();

  if (matchupError || parlayError) {
    return <ComponentError />;
  }

  return (
    <>
      <h1 className="text-3xl md:text-5xl mb-4 font-extrabold" id="home">
        Matchups
      </h1>
      <ParlayServerDataReceiver parlays={parlays} />
      <MatchupBoard {...{ matchups, displayDates }} />
    </>
  );
}
