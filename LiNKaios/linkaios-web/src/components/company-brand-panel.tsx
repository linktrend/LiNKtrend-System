"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, Fingerprint, Megaphone, Monitor, Printer, type LucideIcon } from "lucide-react";

import { CompanyEditableCard } from "@/components/company-editable-card";
import { CompanyFormFields } from "@/components/company-form-fields";
import { brandAssetsForCompany, resolveCompanyFixture, type BrandAssetCategoryFixture } from "@/lib/company-fixtures";

const BRAND_CATEGORY_ICONS: Record<string, LucideIcon> = {
  identity: Fingerprint,
  digital: Monitor,
  print: Printer,
  marketing: Megaphone,
  internal: Building2,
};

function CategoryCard(props: { category: BrandAssetCategoryFixture }) {
  const [items, setItems] = useState(props.category.items);
  const [draft, setDraft] = useState<string[]>(props.category.items);

  useEffect(() => {
    setItems(props.category.items);
    setDraft(props.category.items);
  }, [props.category.id, props.category.items]);

  return (
    <CompanyEditableCard
      icon={BRAND_CATEGORY_ICONS[props.category.id] ?? Fingerprint}
      title={props.category.title}
      description={props.category.description}
      required={props.category.required}
      editContent={
        <CompanyFormFields
          fields={draft.map((item, idx) => ({
            key: String(idx),
            label: `Asset ${idx + 1}`,
            value: item,
          }))}
          values={Object.fromEntries(draft.map((item, idx) => [String(idx), item]))}
          onChange={(key, value) => {
            const idx = Number(key);
            const next = [...draft];
            next[idx] = value;
            setDraft(next);
          }}
        />
      }
      onSave={() => setItems(draft)}
    >
      <ul className="space-y-2 text-sm text-zinc-800 dark:text-zinc-200">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        Upload files here in a later release — assets publish to LiNKbrain company knowledge when connected.
      </p>
    </CompanyEditableCard>
  );
}

export function CompanyBrandPanel() {
  const searchParams = useSearchParams();
  const company = resolveCompanyFixture(searchParams.get("companyId"));
  const categories = useMemo(() => brandAssetsForCompany(company.id), [company.id]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Essential brand materials for <span className="font-medium text-zinc-900 dark:text-zinc-100">{company.displayName}</span>.
        Required categories should be complete before modules go live.
      </p>
      {categories.map((c) => (
        <CategoryCard key={c.id} category={c} />
      ))}
    </div>
  );
}
