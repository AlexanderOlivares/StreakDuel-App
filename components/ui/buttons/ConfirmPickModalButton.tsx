// @ts-expect-error no types defined yet
import { useFormStatus } from "react-dom";

function ConfirmPickModalButton() {
  const { pending } = useFormStatus();

  return (
    <button className="btn uppercase" type="submit" aria-disabled={pending}>
      {pending ? "saving..." : "save"}
    </button>
  );
}

export default ConfirmPickModalButton;
