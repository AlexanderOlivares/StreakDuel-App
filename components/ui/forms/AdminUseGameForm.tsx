"use client";

import { adminUseGame } from "@/app/actions/admin/GamePicker";
import { Matchup } from "@/lib/types/interfaces";
import React, { useState } from "react";

function AdminUseGameForm(props: Matchup) {
  const { strHomeTeam, strAwayTeam, drawEligible, id, adminSelected, oddsType } = props;
  const [checked, setChecked] = useState<boolean>(adminSelected);
  const [radio, setRadio] = useState<string>(oddsType);

  return (
    <form action={adminUseGame}>
      <div className="form-control items-center">
        <label className="label cursor-pointer">
          <span className="label-text mr-3">Use Game</span>
          <input
            name="adminSelected"
            type="checkbox"
            onChange={() => setChecked(!checked)}
            checked={checked}
            className="checkbox checkbox-primary"
          />
          <input hidden={true} name="id" value={id} />
        </label>
      </div>
      <div className="card-actions mt-3 justify-center">
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Moneyline</span>
            <input
              checked={radio === "money-line"}
              onChange={() => setRadio("money-line")}
              type="radio"
              name="oddsType"
              value={radio}
              className="radio checked:bg-blue-500"
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Spread</span>
            <input
              checked={radio === "pointspread"}
              onChange={() => setRadio("pointspread")}
              type="radio"
              name="oddsType"
              value={radio}
              className="radio checked:bg-blue-500"
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Over/Under</span>
            <input
              checked={radio === "totals"}
              onChange={() => setRadio("totals")}
              type="radio"
              name="oddsType"
              value={radio}
              className="radio checked:bg-blue-500"
            />
          </label>
        </div>
        {drawEligible && oddsType === "money-line" && (
          <>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Home Draw</span>
                <input
                  type="radio"
                  name="drawTeam"
                  value={radio}
                  className="radio checked:bg-blue-500"
                  checked={radio === strHomeTeam}
                  onChange={() => setRadio(strHomeTeam)}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Away Draw</span>
                <input
                  type="radio"
                  name="drawTeam"
                  value={radio}
                  className="radio checked:bg-blue-500"
                  checked={radio === strAwayTeam}
                  onChange={() => setRadio(strAwayTeam)}
                />
              </label>
            </div>
          </>
        )}
      </div>
      <button className="btn" type="submit">
        save
      </button>
    </form>
  );
}

export default AdminUseGameForm;
