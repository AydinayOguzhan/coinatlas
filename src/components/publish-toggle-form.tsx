"use client";

import { useFormStatus } from "react-dom";

type PublishToggleFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  isPublished: boolean;
};

function PublishToggleButton({ isPublished }: { isPublished: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={isPublished ? "Make private" : "Publish publicly"}
      className={`relative inline-flex h-8 w-16 items-center rounded-full border transition ${
        isPublished ? "border-moss bg-moss" : "border-line bg-[#f2efe9]"
      } disabled:cursor-wait disabled:opacity-70`}
    >
      <span
        className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${
          isPublished ? "translate-x-8" : "translate-x-0"
        }`}
      />
      <span className="sr-only">{isPublished ? "Published" : "Private"}</span>
    </button>
  );
}

export function PublishToggleForm({ action, isPublished }: PublishToggleFormProps) {
  return (
    <form
      action={action}
      className="flex items-center gap-3"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="text-right">
        <p className="text-[11px] uppercase tracking-[0.22em] text-moss">Visibility</p>
        <p className="mt-1 text-sm font-semibold text-ink">{isPublished ? "Published" : "Private"}</p>
      </div>
      <PublishToggleButton isPublished={isPublished} />
    </form>
  );
}
