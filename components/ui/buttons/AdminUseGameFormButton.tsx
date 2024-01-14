import React from "react";
// @ts-expect-error no types defined yet
import { useFormStatus } from "react-dom";

function AdminUseGameFormButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-sm" type="submit">
      {pending ? "saving..." : "save"}
    </button>
  );
}

export default AdminUseGameFormButton;
