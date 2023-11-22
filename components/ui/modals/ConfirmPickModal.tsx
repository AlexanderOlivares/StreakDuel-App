import { useParlayContext } from "@/app/context/ParlayProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";

interface ConfirmPickModalProps {
  open: boolean;
  setConfirmPickModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UpsertParlayProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  picks: any;
}

function upsertParlay(mutationProps: UpsertParlayProps) {
  return axios.post("/api/parlay", mutationProps);
}

function ConfirmPickModal({ open, setConfirmPickModalOpen }: ConfirmPickModalProps) {
  const queryClient = useQueryClient();
  const parlayContext = useParlayContext();
  const { activePicks, dbActivePicks } = parlayContext.state;

  const parlay = useMutation({
    mutationFn: (mutationProps: UpsertParlayProps) => upsertParlay(mutationProps),
    onSuccess: () => {
      queryClient.invalidateQueries(["getParlays", "getMatchups"]);
      queryClient.refetchQueries({ stale: true });
      setConfirmPickModalOpen(false);
    },
    onError: ({ error }) => {
      console.error(error);
    },
  });

  function handleSubmit() {
    parlay.mutate({ picks: activePicks });
    console.log("HANDLE SUBMIT ???");
  }

  function handleClose() {
    setConfirmPickModalOpen(false);
    // TODO don't clear out all active picks on cancel
    parlayContext.dispatch({
      type: "addActivePick",
      payload: {
        ...parlayContext.state,
        activePicks: dbActivePicks,
      },
    });
  }

  function handleRemovePick(matchupId: string) {
    const picks = activePicks.filter(pick => pick.matchupId !== matchupId);
    parlayContext.dispatch({
      type: "addActivePick",
      payload: {
        ...parlayContext.state,
        activePicks: picks,
      },
    });
  }

  function handleUseLatestOdds(useLatestOdds: boolean) {
    const picks = activePicks.map(pick => ({ ...pick, useLatestOdds }));
    parlayContext.dispatch({
      type: "addActivePick",
      payload: {
        ...parlayContext.state,
        activePicks: picks,
      },
    });
  }

  return (
    <>
      <dialog id="confirm-pick-modal" className="modal" open={open}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">{activePicks?.[0]?.pick}</h3>
          <h3 className="font-bold text-lg">{activePicks?.[0]?.pickOdds}</h3>
          <p className="py-4">Press ESC key or click outside to close</p>
          <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>
                    <label></label>
                  </th>
                  <th>Odds</th>
                  <th>Pick</th>
                  <th>Accept Odds Changes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                {activePicks.map(pick => {
                  return (
                    <>
                      <tr>
                        <th>
                          <button
                            onClick={() => handleRemovePick(pick.matchupId)}
                            className="btn-sm btn-circle btn-outline"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </th>
                        <td>{pick.pickOdds}</td>
                        <td>
                          <div className="flex items-center space-x-3">
                            {pick.badge && (
                              <div className="avatar">
                                <div className="mask mask-squircle w-12 h-12">
                                  <Image
                                    width={50}
                                    height={50}
                                    src={`${pick.badge}/tiny`}
                                    alt="Pick badge"
                                  />
                                </div>
                              </div>
                            )}
                            <div>
                              <div className="font-bold">{pick.pick}</div>
                              <div className="text-sm opacity-50">{pick.oddsType}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            className="toggle"
                            checked={pick.useLatestOdds}
                            onChange={() => handleUseLatestOdds(!pick.useLatestOdds)}
                          />
                        </td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
              {/* foot */}
              <tfoot>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Job</th>
                  <th>Favorite Color</th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button className="btn" onClick={handleClose}>
              close
            </button>
            <button className="btn" type="submit" onClick={handleSubmit}>
              save
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}

export default ConfirmPickModal;
