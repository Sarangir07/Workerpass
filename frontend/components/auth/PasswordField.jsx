"use client";

import { useState } from "react";
import TextField from "../ui/TextField";

export default function PasswordField(props) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      rightSlot={
        <button
          aria-label={visible ? "Hide password" : "Show password"}
          className="rounded-md px-2 py-1 text-xs font-black text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          type="button"
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      }
    />
  );
}
