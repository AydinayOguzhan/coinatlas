import Image from "next/image";
import { getPublicUploadPath } from "@/lib/uploads";

type CoinFormValues = {
  numistaId?: string | null | undefined;
  title?: string | null | undefined;
  country?: string | null | undefined;
  isPublished?: boolean | null | undefined;
  issuer?: string | null | undefined;
  denomination?: string | null | undefined;
  currency?: string | null | undefined;
  year?: string | null | undefined;
  minYear?: number | null | undefined;
  maxYear?: number | null | undefined;
  composition?: string | null | undefined;
  weight?: number | null | undefined;
  diameter?: number | null | undefined;
  thickness?: number | null | undefined;
  shape?: string | null | undefined;
  edge?: string | null | undefined;
  obverseDescription?: string | null | undefined;
  reverseDescription?: string | null | undefined;
  obverseImageUrl?: string | null | undefined;
  reverseImageUrl?: string | null | undefined;
  notes?: string | null | undefined;
  quantity?: number | null | undefined;
  condition?: string | null | undefined;
  acquisitionDate?: string | null | undefined;
  acquisitionPrice?: number | null | undefined;
  storageLocation?: string | null | undefined;
  sourceUrl?: string | null | undefined;
  images?: Array<{
    id: number;
    side: "obverse" | "reverse" | "unknown";
    filePath: string;
  }> | undefined;
};

type CoinFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  initialValues?: CoinFormValues;
};

const textFields = [
  ["title", "Title", true],
  ["country", "Country", true],
  ["issuer", "Issuer", false],
  ["denomination", "Denomination", false],
  ["currency", "Currency", false],
  ["year", "Visible year", false],
  ["minYear", "Min year", false],
  ["maxYear", "Max year", false],
  ["composition", "Composition", false],
  ["weight", "Weight (g)", false],
  ["diameter", "Diameter (mm)", false],
  ["thickness", "Thickness (mm)", false],
  ["shape", "Shape", false],
  ["edge", "Edge", false],
  ["condition", "Condition", false],
  ["acquisitionDate", "Acquisition date", false],
  ["acquisitionPrice", "Acquisition price", false],
  ["storageLocation", "Storage location", false],
  ["sourceUrl", "Source URL", false],
  ["numistaId", "Numista ID", false],
  ["quantity", "Quantity", false]
] as const;

export function CoinForm({ action, submitLabel, initialValues }: CoinFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {textFields.map(([key, label, required]) => (
          <label key={key} className="space-y-2 text-sm font-medium text-ink">
            <span>{label}</span>
            <input
              name={key}
              required={required}
              defaultValue={initialValues?.[key] == null ? "" : String(initialValues[key] ?? "")}
              type={key.toLowerCase().includes("price") || key === "weight" || key === "diameter" || key === "thickness" ? "number" : "text"}
              step="any"
            />
          </label>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Obverse description</span>
          <textarea
            name="obverseDescription"
            rows={4}
            defaultValue={initialValues?.obverseDescription ?? ""}
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Reverse description</span>
          <textarea
            name="reverseDescription"
            rows={4}
            defaultValue={initialValues?.reverseDescription ?? ""}
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-ink">
        <span>Notes</span>
        <textarea name="notes" rows={5} defaultValue={initialValues?.notes ?? ""} />
      </label>

      <label className="flex items-start gap-3 rounded-[1.5rem] border border-line/70 bg-paper/70 p-4 text-sm text-ink">
        <input type="checkbox" name="isPublished" defaultChecked={Boolean(initialValues?.isPublished)} className="mt-1 h-4 w-4 shrink-0" />
        <span>
          <strong className="block text-ink">Publish publicly</strong>
          This coin will appear on the public showcase and public detail pages. Leave it unchecked to keep it admin-only.
        </span>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        {initialValues?.obverseImageUrl ? (
          <div className="space-y-3 rounded-[1.5rem] border border-line/70 bg-paper/70 p-4 text-sm font-medium text-ink">
            <span>Imported obverse image</span>
            <div className="relative h-72 overflow-hidden rounded-2xl bg-white">
              <Image src={initialValues.obverseImageUrl} alt="Imported obverse" fill className="object-contain" unoptimized />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input type="checkbox" name="useImportedObverseImage" defaultChecked />
              <span>Use this imported Numista obverse image</span>
            </label>
            <input type="hidden" name="importedObverseImageUrl" value={initialValues.obverseImageUrl} />
          </div>
        ) : null}
        {initialValues?.reverseImageUrl ? (
          <div className="space-y-3 rounded-[1.5rem] border border-line/70 bg-paper/70 p-4 text-sm font-medium text-ink">
            <span>Imported reverse image</span>
            <div className="relative h-72 overflow-hidden rounded-2xl bg-white">
              <Image src={initialValues.reverseImageUrl} alt="Imported reverse" fill className="object-contain" unoptimized />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input type="checkbox" name="useImportedReverseImage" defaultChecked />
              <span>Use this imported Numista reverse image</span>
            </label>
            <input type="hidden" name="importedReverseImageUrl" value={initialValues.reverseImageUrl} />
          </div>
        ) : null}
      </div>

      {initialValues?.images?.length ? (
        <div className="space-y-3">
          <h3 className="font-display text-2xl text-ink">Existing images</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {initialValues.images.map((image) => (
              <div key={image.id} className="space-y-3 rounded-[1.5rem] border border-line/70 bg-paper/70 p-4 text-sm font-medium text-ink">
                <div className="relative h-72 overflow-hidden rounded-2xl bg-white">
                  <Image
                    src={getPublicUploadPath(image.filePath)}
                    alt={`Existing ${image.side}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="capitalize">{image.side}</span>
                  <label className="flex items-center gap-2 text-sm font-medium text-ink">
                    <input type="checkbox" name="removeImageIds" value={String(image.id)} />
                    <span>Remove this image</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Obverse image {initialValues?.images?.some((image) => image.side === "obverse") ? "(replaces current obverse images)" : ""}</span>
          <input name="obverseImage" type="file" accept="image/png,image/jpeg,image/webp" />
        </label>
        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Reverse image {initialValues?.images?.some((image) => image.side === "reverse") ? "(replaces current reverse images)" : ""}</span>
          <input name="reverseImage" type="file" accept="image/png,image/jpeg,image/webp" />
        </label>
      </div>

      <p className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-ink/80">
        External results are suggestions only. Review and edit every field before saving to your collection.
      </p>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-moss"
      >
        {submitLabel}
      </button>
    </form>
  );
}
