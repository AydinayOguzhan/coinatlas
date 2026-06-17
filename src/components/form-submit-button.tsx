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
      className="inline-flex min-w-52 items-center justify-center rounded-full bg-[#e6c093] px-5 py-3 text-sm font-semibold text-ink disabled:cursor-wait disabled:bg-[#e6c093]/70"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
