import { upsertParlay } from "@/app/actions/parlay/upsertParlay";
import { useParlayContext } from "@/context/ParlayProvider";
import { calculateParlayPayout, formatDisplayOdds } from "@/lib/oddsUtils/oddsUtils";
import { IPick } from "@/lib/types/interfaces";
import Image from "next/image";
import ConfirmPickModalButton from "../buttons/ConfirmPickModalButton";

interface ConfirmPickModalProps {
  open: boolean;
  setConfirmPickModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function ConfirmPickModal({ open, setConfirmPickModalOpen }: ConfirmPickModalProps) {
  const parlayContext = useParlayContext();
  const { activePicks, dbActivePicks, activePoints, pickHistory, dbPickHistory } =
    parlayContext.state;

  function handleClose(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    parlayContext.dispatch({
      type: "addActivePick",
      payload: {
        ...parlayContext.state,
        activePicks: dbActivePicks,
        pickHistory: dbPickHistory,
      },
    });
    setConfirmPickModalOpen(false);
  }

  function handleRemovePick(matchupId: string) {
    const picks = activePicks.filter(pick => pick.matchupId !== matchupId);
    const history = pickHistory.filter(pick => pick.matchupId !== matchupId);
    parlayContext.dispatch({
      type: "removeActivePick",
      payload: {
        ...parlayContext.state,
        activePicks: picks,
        pickHistory: history,
      },
    });
  }

  function handleUseLatestOdds(useLatestOdds: boolean, pickId?: string) {
    const picks = activePicks.map(pick => ({
      ...pick,
      ...(pickId === pick.pickId ? { useLatestOdds } : {}),
    }));
    parlayContext.dispatch({
      type: "toggleUseLatestOdds",
      payload: {
        ...parlayContext.state,
        activePicks: picks,
      },
    });
  }

  function getDisplayOdds(activePicks: IPick[]) {
    const activePickOdds = activePicks.map(({ pickOdds }) => pickOdds);
    return calculateParlayPayout(activePoints, activePickOdds);
  }

  const submitForm = async (formData: FormData) => {
    const result = await upsertParlay(formData);
    if (result?.error) {
      // TODO add toast here
      alert(result.error);
    } else {
      setConfirmPickModalOpen(false);
      parlayContext.dispatch({
        type: "upsertParlaySuccess",
        payload: {
          ...parlayContext.state,
          dbActivePicks: activePicks,
          dbPickHistory: pickHistory,
        },
      });
    }
  };

  return (
    <>
      <dialog id="confirm-pick-modal" className="modal" open={open}>
        <div className="modal-box">
          <form action={submitForm} method="dialog">
            {/* <form action={formAction} method="dialog"> */}
            <h3 className="font-bold text-lg">
              {activePicks.length > 1 ? "Parlay" : activePicks?.[0]?.pick}
            </h3>
            <h3 className="font-bold text-lg">{`Points wagered: ${activePoints}`}</h3>
            <h3 className="font-bold text-lg">
              {`To win: ${activePicks.length > 0 ? getDisplayOdds(activePicks) : "0"}`}
            </h3>
            <p className="py-4"></p>
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
                  {activePicks &&
                    activePicks.map(pick => {
                      return (
                        <tr key={pick.pickId}>
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
                          <td>{formatDisplayOdds(pick.pickOdds)}</td>
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
                              className={`toggle ${pick.useLatestOdds ? "toggle-success" : ""}`}
                              checked={pick.useLatestOdds}
                              onChange={() => handleUseLatestOdds(!pick.useLatestOdds, pick.pickId)}
                            />
                            <input
                              hidden={true}
                              readOnly
                              name="picks"
                              value={JSON.stringify(activePicks)}
                            />
                          </td>
                        </tr>
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
            <div className="modal-backdrop">
              <button className="btn" onClick={handleClose}>
                close
              </button>
              <ConfirmPickModalButton />
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}

export default ConfirmPickModal;
