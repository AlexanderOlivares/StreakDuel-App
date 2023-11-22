import { useParlayContext } from "@/app/context/ParlayProvider";
import React from "react";

export default function PromoBar() {
  const parlayContext = useParlayContext();
  const { activePoints } = parlayContext.state;
  return (
    <details className="collapse bg-base-200  m-1">
      <summary className="collapse-title text-xl font-medium">Click to open/close</summary>
      <div className="collapse-content">
        <p>{`Points ${activePoints}`}</p>
      </div>
    </details>
  );
}
