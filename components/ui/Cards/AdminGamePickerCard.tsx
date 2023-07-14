import React from "react";

export interface IAdminGamePickerCard {
  gameDate: string;
  gameTime: string;
  id: string;
  league: string;
  name: string;
}

export default function AdminGamePickerCard(props: IAdminGamePickerCard) {
  const { gameTime, league, name } = props;
  return (
    <div className="card w-96 bg-neutral text-neutral-content">
      <div className="card-body items-center text-center">
        <h2 className="card-title">{name}</h2>
        <p>{gameTime}</p>
        <p>{league}</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">Moneyline</button>
          <button className="btn btn-ghost">Over/Under</button>
        </div>
      </div>
    </div>
  );
}
