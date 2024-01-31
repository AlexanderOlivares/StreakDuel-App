"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import WelcomeFormButton from "../buttons/WelcomeFormButton";
import { updateUsername } from "@/app/actions/user/updateUsername";

function WelcomeModal() {
  const { data: session, update } = useSession();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleDisplayNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  useEffect(() => {
    if (session?.user?.mustUpdateUsername) {
      if (session.user.email) {
        setEmail(session.user.email);
      }
      if (session.user.name) {
        setUsername(session.user.name.slice(0, 20).split(" ")[0]);
      }
      setModalOpen(true);
    }
  }, [session]);

  const submitForm = async (formData: FormData) => {
    const result = await updateUsername(formData);
    if (result?.error) {
      // TODO add toast here
      alert(result.error);
    } else {
      update({ mustUpdateUsername: false });
      setModalOpen(false);
    }
  };

  return (
    <dialog id="new-user-welcome-modal" className="modal" open={modalOpen}>
      <div className="modal-box text-center">
        <h3 className="font-bold text-lg">{"Welcome to Streak Duel"}</h3>
        <div className="modal-action">
          <form action={submitForm} method="dialog">
            <label htmlFor="set-username" className="p-2">
              {"Set your username"}
            </label>
            <input
              name="username"
              id="set-username"
              aria-label="username"
              required
              type="text"
              value={username}
              onChange={handleDisplayNameChange}
              className="input input-bordered w-full max-w-xs mt-2"
              minLength={5}
              maxLength={20}
              pattern="^[a-zA-Z0-9_\-]*$"
            />
            <input hidden readOnly={true} name="email" id="email" type="email" value={email} />
            <p className="text-xs my-3">
              {"Only letters, numbers, underscores and dashes. 5-20 characters."}
            </p>
            <div className="modal-backdrop">
              <WelcomeFormButton />
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
}

export default WelcomeModal;
