"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function FormSubmitButton({ idleLabel, pendingLabel }: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-w-52 items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper disabled:cursor-wait disabled:bg-ink/70"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
