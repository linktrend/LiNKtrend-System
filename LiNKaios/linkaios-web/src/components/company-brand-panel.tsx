"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Fingerprint, Megaphone, Monitor, Printer, type LucideIcon } from "lucide-react";

import { CompanyBrandCatalog, CompanyBrandCatalogBackLink } from "@/components/company-brand-catalog";
import { CompanyEditableCard } from "@/components/company-editable-card";
import { FormFileUpload } from "@/components/forms";
import { resolveBrandFixture } from "@/lib/brand-fixtures";
import { brandAssetsForCompany, resolveCompanyFixture, type BrandAssetCategoryFixture } from "@/lib/company-fixtures";
import { brandsForCompany } from "@/lib/brand-fixtures";
import { useLicenseeContext } from "@/hooks/use-licensee-context";
import { COMPANY_FORM_ROW } from "@/lib/ui-standards";

const BRAND_CATEGORY_ICONS: Record<string, LucideIcon> = {
  identity: Fingerprint,
  digital: Monitor,
  print: Printer,
  marketing: Megaphone,
  internal: Building2,
};

const BRAND_FILE_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.webp,.svg,.ai,.eps,.doc,.docx,.ppt,.pptx,.key,.zip,.fig";

type SlotUploadState = {
  fileName: string | null;
  fileSize: number | null;
};

function uploadsFromCategory(category: BrandAssetCategoryFixture): Record<string, SlotUploadState> {
  return Object.fromEntries(
    category.slots.map((slot) => [
      slot.id,
      { fileName: slot.fileName ?? null, fileSize: null },
    ]),
  );
}

function CategoryCard(props: { category: BrandAssetCategoryFixture }) {
  const [uploads, setUploads] = useState<Record<string, SlotUploadState>>(() =>
    uploadsFromCategory(props.category),
  );
  const [draft, setDraft] = useState<Record<string, SlotUploadState>>(() => uploadsFromCategory(props.category));

  useEffect(() => {
    const next = uploadsFromCategory(props.category);
    setUploads(next);
    setDraft(next);
  }, [props.category]);

  const uploadedCount = props.category.slots.filter((slot) => uploads[slot.id]?.fileName).length;

  return (
    <CompanyEditableCard
      icon={BRAND_CATEGORY_ICONS[props.category.id] ?? Fingerprint}
      title={props.category.title}
      description={props.category.description}
      required={props.category.required}
      onEditStart={() => setDraft(structuredClone(uploads))}
      onCancelEdit={() => setDraft(structuredClone(uploads))}
      editContent={
        <div className="space-y-4">
          {props.category.slots.map((slot) => (
            <div key={slot.id} className={COMPANY_FORM_ROW}>
              <label
                htmlFor={`${props.category.id}-${slot.id}-upload`}
                className="text-sm font-medium text-zinc-500 dark:text-zinc-400"
              >
                {slot.label}
              </label>
              <FormFileUpload
                id={`${props.category.id}-${slot.id}-upload`}
                accept={BRAND_FILE_ACCEPT}
                hint="PDF, image, vector, office, or archive files."
                fileName={draft[slot.id]?.fileName}
                fileSize={draft[slot.id]?.fileSize}
                onChange={(file) =>
                  setDraft((current) => ({
                    ...current,
                    [slot.id]: {
                      fileName: file?.name ?? null,
                      fileSize: file?.size ?? null,
                    },
                  }))
                }
              />
            </div>
          ))}
        </div>
      }
      onSave={() => setUploads(structuredClone(draft))}
    >
      <ul className="space-y-3">
        {props.category.slots.map((slot) => {
          const upload = uploads[slot.id];
          const hasFile = Boolean(upload?.fileName);
          return (
            <li key={slot.id} className="flex items-start justify-between gap-4">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{slot.label}</span>
              <span className={`min-w-0 truncate text-right text-sm ${hasFile ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-500 dark:text-zinc-400"}`}>
                {hasFile ? upload.fileName : "No file uploaded"}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        {uploadedCount} of {props.category.slots.length} assets uploaded — preview only until LiNKbrain brand storage is connected.
      </p>
    </CompanyEditableCard>
  );
}

export function CompanyBrandPanel(props: { companyId: string; brandId: string | null }) {
  const { display, effectiveBrandId } = useLicenseeContext();
  const company = resolveCompanyFixture(props.companyId);
  const activeBrandId = props.brandId ?? effectiveBrandId;
  const brand = resolveBrandFixture(activeBrandId, props.companyId);
  const brands = brandsForCompany(props.companyId);
  const categories = useMemo(() => brandAssetsForCompany(company.id), [company.id]);

  const showCatalog = display.brandTabIsCatalog && brands.length > 1 && !props.brandId;

  if (showCatalog) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Market-facing brands under <span className="font-medium text-zinc-900 dark:text-zinc-100">{company.displayName}</span>.
          Select a brand to manage assets and guidelines.
        </p>
        <CompanyBrandCatalog companyId={props.companyId} />
      </div>
    );
  }

  const brandLabel = brand?.name ?? company.displayName;

  return (
    <div className="space-y-4">
      {display.brandTabIsCatalog && brands.length > 1 ? (
        <div className="flex justify-end">
          <CompanyBrandCatalogBackLink companyId={props.companyId} />
        </div>
      ) : null}
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Essential brand materials for{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{brandLabel}</span>
        {brand && brand.name !== company.displayName ? (
          <span className="text-zinc-500 dark:text-zinc-400"> ({company.displayName})</span>
        ) : null}
        . Required categories should be complete before suites go live.
      </p>
      {categories.map((c) => (
        <CategoryCard key={c.id} category={c} />
      ))}
    </div>
  );
}
