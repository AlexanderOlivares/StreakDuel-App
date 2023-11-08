import { useParlayContext } from "@/app/context/ParlayProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";

interface ConfirmPickModalProps {
  open: boolean;
  setConfirmPickModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UpsertParlayProps {
  parlays: any;
}

function upsertParlay(mutationProps: UpsertParlayProps) {
  return axios.post("/api/parlay", mutationProps);
}

function ConfirmPickModal({ open, setConfirmPickModalOpen }: ConfirmPickModalProps) {
  const queryClient = useQueryClient();
  const parlayContext = useParlayContext();
  const { activePicks } = parlayContext.state;

  const parlay = useMutation({
    mutationFn: (mutationProps: UpsertParlayProps) => upsertParlay(mutationProps),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getMatchups"] });
      setConfirmPickModalOpen(false);
    },
    onError: ({ error }) => {
      console.error(error);
    },
  });

  function handleSubmit() {
    parlay.mutate({ parlays: activePicks });
    console.log("HANDLE SUBMIT ???");
  }

  function handleClose() {
    setConfirmPickModalOpen(false);
    // TODO don't clear out all active picks on cancel
    parlayContext.dispatch({
      type: "addActivePick",
      payload: {
        ...parlayContext.state,
        activePicks: [],
      },
    });
  }

  return (
    <>
      <dialog id="confirm-pick-modal" className="modal" open={open}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">{activePicks[0]?.pick}</h3>
          <h3 className="font-bold text-lg">{activePicks[0]?.pickOdds}</h3>
          <p className="py-4">Press ESC key or click outside to close</p>
          <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
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
                  console.log(pick);

                  return (
                    <>
                      <tr>
                        <th>
                          <label>
                            <input type="checkbox" className="checkbox" />
                          </label>
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
                          <input type="checkbox" className="toggle" checked={pick.useLatestOdds} />
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
