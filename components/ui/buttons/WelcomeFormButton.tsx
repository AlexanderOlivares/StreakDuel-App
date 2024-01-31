import React from "react";
// @ts-expect-error no types defined yet
import { useFormStatus } from "react-dom";

function WelcomeFormButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-md uppercase" type="submit" disabled={pending}>
      {pending ? "saving..." : "save and continue"}
    </button>
  );
}

export default WelcomeFormButton;
