"use client";

import { useState } from "react";

type Variant = { label: string; price: number };

type ProductInitial = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  basePrice: number | null;
  isFeatured: boolean;
  isActive: boolean;
  images: string[];
  variants: Variant[];
};

type ProductFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  categories: { id: string; name: string }[];
  initial?: ProductInitial;
  deleteAction?: () => void | Promise<void>;
};

const labelClass = "block text-sm font-medium text-cream";
const inputClass =
  "mt-1 w-full rounded-lg border border-gold/15 bg-surface-2 px-4 py-2.5 text-cream placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

type VariantRow = { key: number; label: string; price: string };

export function ProductForm({
  action,
  categories,
  initial,
  deleteAction,
}: ProductFormProps) {
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.length
      ? initial.variants.map((v, i) => ({
          key: i,
          label: v.label,
          price: String(v.price),
        }))
      : []
  );
  const [nextKey, setNextKey] = useState(initial?.variants.length ?? 0);

  function addVariant() {
    setVariants((rows) => [...rows, { key: nextKey, label: "", price: "" }]);
    setNextKey((k) => k + 1);
  }

  function removeVariant(key: number) {
    setVariants((rows) => rows.filter((r) => r.key !== key));
  }

  function updateVariant(key: number, field: "label" | "price", value: string) {
    setVariants((rows) =>
      rows.map((r) => (r.key === key ? { ...r, [field]: value } : r))
    );
  }

  return (
    <form action={action} className="space-y-6">
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initial?.name ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="slug" className={labelClass}>
          Slug <span className="text-muted">(lowercase, dashes only)</span>
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          defaultValue={initial?.slug ?? ""}
          placeholder="my-product-name"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          required
          defaultValue={initial?.description ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="categoryId" className={labelClass}>
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={initial?.categoryId ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="basePrice" className={labelClass}>
          Base price <span className="text-muted">(blank for variants only)</span>
        </label>
        <input
          id="basePrice"
          name="basePrice"
          type="number"
          min={0}
          step={1}
          defaultValue={initial?.basePrice ?? ""}
          placeholder="e.g. 1500"
          className={inputClass}
        />
      </div>

      {initial?.images && initial.images.length > 0 && (
        <fieldset>
          <legend className={labelClass}>Existing images</legend>
          <div className="mt-2 flex flex-wrap gap-4">
            {initial.images.map((url) => (
              <label
                key={url}
                className="flex flex-col items-center gap-2 rounded-lg border border-gold/15 bg-surface-2 p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Product image"
                  className="h-20 w-20 rounded object-cover"
                />
                <span className="flex items-center gap-1 text-xs text-cream">
                  <input
                    type="checkbox"
                    name="existingImage"
                    value={url}
                    defaultChecked
                  />
                  Keep
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor="images" className={labelClass}>
          Upload images
        </label>
        <input
          id="images"
          name="images"
          type="file"
          multiple
          accept="image/*"
          className="mt-1 w-full text-sm text-cream file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:font-semibold file:text-bg hover:file:brightness-110"
        />
      </div>

      <fieldset>
        <legend className={labelClass}>Variants</legend>
        <div className="mt-2 space-y-3">
          {variants.map((row) => (
            <div key={row.key} className="flex gap-3">
              <input
                type="text"
                name="variantLabel"
                value={row.label}
                onChange={(e) => updateVariant(row.key, "label", e.target.value)}
                placeholder="Label (e.g. Small)"
                className={`${inputClass} mt-0`}
              />
              <input
                type="number"
                name="variantPrice"
                min={0}
                step={1}
                value={row.price}
                onChange={(e) => updateVariant(row.key, "price", e.target.value)}
                placeholder="Price"
                className={`${inputClass} mt-0 w-32`}
              />
              <button
                type="button"
                onClick={() => removeVariant(row.key)}
                className="shrink-0 rounded-lg border border-gold/20 px-3 text-muted transition hover:border-red-400 hover:text-red-400"
                aria-label="Remove variant"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="mt-3 rounded-full border border-gold/30 px-4 py-1.5 text-sm text-cream transition hover:border-gold hover:text-gold"
        >
          + Add variant
        </button>
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
        <label className="flex items-center gap-2 text-sm text-cream">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={initial?.isFeatured ?? false}
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-cream">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={initial?.isActive ?? true}
          />
          Active
        </label>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          className="rounded-full bg-gold px-8 py-3 font-semibold text-bg shadow-sm transition hover:brightness-110"
        >
          Save
        </button>
        {deleteAction && (
          <button
            type="submit"
            formAction={deleteAction}
            onClick={(e) => {
              if (
                !window.confirm("Delete this product? This cannot be undone.")
              ) {
                e.preventDefault();
              }
            }}
            className="rounded-full border border-red-400/40 px-6 py-3 font-semibold text-red-400 transition hover:bg-red-400/10"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
