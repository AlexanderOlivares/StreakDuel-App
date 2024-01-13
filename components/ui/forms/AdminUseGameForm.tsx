"use client";

import { adminUseGame } from "@/app/actions/admin/GamePicker";
import React, { useState } from "react";

interface AdminUseGameFormProps {
  id: string;
  adminSelected: boolean;
}

function AdminUseGameForm({ id, adminSelected }: AdminUseGameFormProps) {
  const [checked, setChecked] = useState<boolean>(adminSelected);

  return (
    <form action={adminUseGame}>
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Use Game</span>
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
      <button className="btn" type="submit">
        save
      </button>
    </form>
  );
}

export default AdminUseGameForm;
