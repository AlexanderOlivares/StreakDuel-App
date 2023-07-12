import React from "react";

export default function PromoBar() {
  return (
    <details className="collapse bg-base-200  m-1">
      <summary className="collapse-title text-xl font-medium">Click to open/close</summary>
      <div className="collapse-content">
        <p>content</p>
      </div>
    </details>
  );
}
