"use client";

import { useFormStatus } from "react-dom";

export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`mt-4 w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 ${
        pending ? "cursor-not-allowed opacity-70" : ""
      }`}
    >
      {pending ? "Accesso in corso…" : "Entra"}
    </button>
  );
}
