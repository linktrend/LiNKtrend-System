"use client";

import { useEffect, useId, useState } from "react";
import { Palette } from "lucide-react";

import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { TableBoolToggle } from "@/components/data-table/table-bool-toggle";
import { TitledCardHeader } from "@/components/titled-card-header";
import {
  activateTheme,
  createCustomTheme,
  EVENT_APPEARANCE_THEMES_CHANGED,
  getThemeIcon,
  listAllThemes,
  readActiveThemeId,
  readCustomThemes,
  readRotationThemeIds,
  removeThemeFromRotation,
  setThemeInRotation,
  THEME_ICON_OPTIONS,
  writeCustomThemes,
  type ThemeIconId,
  type ThemeProfile,
} from "@/lib/appearance-themes";
import type { ThemeChoice } from "@/components/theme-root";
import { FormField, FormSelect, FormTextInput } from "@/components/forms";
import { BUTTON, FIELD, formatUiLabel } from "@/lib/ui-standards";

function AddThemeModal(props: {
  open: boolean;
  onClose: () => void;
  onAdd: (input: { name: string; icon: ThemeIconId; appearance: ThemeChoice }) => void;
}) {
  const titleId = useId();
  const [name, setName] = useState("Brand theme");
  const [icon, setIcon] = useState<ThemeIconId>("Palette");
  const [appearance, setAppearance] = useState<ThemeChoice>("light");

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-zinc-900/50 dark:bg-black/60" aria-label="Close dialog" onClick={props.onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
        <h2 id={titleId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Create theme
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Custom themes use a light or dark base appearance and can be added to the toolbar theme cycle.
        </p>
        <div className="mt-4 space-y-4">
          <FormField id="theme-name" label="Theme name">
            {({ id, invalid, describedBy }) => (
              <FormTextInput id={id} invalid={invalid} describedBy={describedBy} value={name} onChange={setName} />
            )}
          </FormField>
          <FormField id="theme-appearance" label="Base appearance">
            {({ id, invalid, describedBy }) => (
              <FormSelect
                id={id}
                invalid={invalid}
                describedBy={describedBy}
                fullWidth={false}
                value={appearance}
                onChange={(value) => setAppearance(value as ThemeChoice)}
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
              />
            )}
          </FormField>
        </div>
        <div className="mt-4">
          <span className={FIELD.label}>{formatUiLabel("Toolbar icon")}</span>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
            {THEME_ICON_OPTIONS.map((option) => {
              const Icon = getThemeIcon(option.id);
              const selected = icon === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setIcon(option.id)}
                  className={
                    "inline-flex h-10 w-10 items-center justify-center rounded-lg border transition " +
                    (selected
                      ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-900"
                      : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-600")
                  }
                  title={option.label}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className={BUTTON.secondaryRow} onClick={props.onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={BUTTON.primaryRow}
            onClick={() => {
              props.onAdd({ name, icon, appearance });
              props.onClose();
            }}
          >
            Create theme
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppearanceSettingsPage() {
  const [themes, setThemes] = useState<ThemeProfile[]>([]);
  const [rotationIds, setRotationIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  function sync() {
    setThemes(listAllThemes());
    setRotationIds(readRotationThemeIds());
  }

  useEffect(() => {
    sync();
    window.addEventListener(EVENT_APPEARANCE_THEMES_CHANGED, sync);
    return () => window.removeEventListener(EVENT_APPEARANCE_THEMES_CHANGED, sync);
  }, []);

  function showFlash(message: string) {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 3000);
  }

  function handleRotationToggle(themeId: string, included: boolean) {
    setThemeInRotation(themeId, included);
    sync();
    showFlash(included ? "Theme added to toolbar cycle." : "Theme removed from toolbar cycle.");
  }

  function handleAdd(input: { name: string; icon: ThemeIconId; appearance: ThemeChoice }) {
    writeCustomThemes([...readCustomThemes(), createCustomTheme(input)]);
    sync();
    showFlash("Custom theme created.");
  }

  function handleRemove(themeId: string) {
    removeThemeFromRotation(themeId);
    const nextCustom = readCustomThemes().filter((theme) => theme.id !== themeId);
    writeCustomThemes(nextCustom);
    if (readActiveThemeId() === themeId) activateTheme("light");
    sync();
    showFlash("Custom theme removed.");
  }

  const customThemes = themes.filter((theme) => !theme.builtIn);

  function renderRotationCell(theme: ThemeProfile) {
    if (theme.builtIn) {
      return (
        <td className={DT.tdControl}>
          <div className={`${DT.controlInner} text-xs text-zinc-500 dark:text-zinc-400`}>Always included</div>
        </td>
      );
    }

    const inRotation = rotationIds.includes(theme.id);
    return (
      <td className={DT.tdControl}>
        <div className={DT.controlInner}>
          <TableBoolToggle
            on={inRotation}
            ariaLabel={`${theme.name} in toolbar cycle`}
            onToggle={(next) => handleRotationToggle(theme.id, next)}
          />
        </div>
      </td>
    );
  }

  return (
    <div className="space-y-6">
      {flash ? (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
          {flash}
        </p>
      ) : null}

      <section className="space-y-4">
        <TitledCardHeader
          icon={Palette}
          title="Built-in themes"
          description="Light and dark are always in the toolbar cycle. Press the theme button in the shell header to switch between included themes."
        />
        <DataTableShell>
          <DataTable>
            <colgroup>
              <col className="w-[14%]" />
              <col className="w-[30%]" />
              <col className="w-[24%]" />
              <col className="w-[32%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Icon")}</div>
                </th>
                <th className={DT.thTextInset}>{formatUiLabel("Theme name")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Appearance")}</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Toolbar cycle")}</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {themes
                .filter((theme) => theme.builtIn)
                .map((theme) => {
                  const Icon = getThemeIcon(theme.icon);
                  return (
                    <DataTableRow key={theme.id} multiline>
                      <td className={DT.tdControl}>
                        <div className={DT.controlInner}>
                          <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                        </div>
                      </td>
                      <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                        <span className={DT.tdTextSpan}>{theme.name}</span>
                      </td>
                      <td className={DT.tdClipInset}>
                        <span className={DT.tdTextSpan}>{formatUiLabel(theme.appearance)}</span>
                      </td>
                      {renderRotationCell(theme)}
                    </DataTableRow>
                  );
                })}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>

      <section className="mt-10 space-y-4">
        <TitledCardHeader
          icon={Palette}
          title="Custom themes"
          description="Create additional themes with your own toolbar icon. Include them in the cycle to switch to them from the shell header button."
          action={
            <button type="button" className={`${BUTTON.addRow} shrink-0`} onClick={() => setModalOpen(true)}>
              Add Theme
            </button>
          }
        />

        {customThemes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            No custom themes yet. Create one, then add it to the toolbar cycle to switch to it from the header theme button.
          </p>
        ) : (
          <DataTableShell>
            <DataTable>
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[28%]" />
                <col className="w-[22%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
              </colgroup>
              <DataTableHead>
                <tr>
                  <th className={DT.thControl}>
                    <div className={DT.controlInner}>{formatUiLabel("Icon")}</div>
                  </th>
                  <th className={DT.thTextInset}>{formatUiLabel("Theme name")}</th>
                  <th className={DT.thTextInset}>{formatUiLabel("Appearance")}</th>
                  <th className={DT.thControl}>
                    <div className={DT.controlInner}>{formatUiLabel("Toolbar cycle")}</div>
                  </th>
                  <th className={DT.thControl}>
                    <div className={DT.controlInner}>{formatUiLabel("Remove")}</div>
                  </th>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {customThemes.map((theme) => {
                  const Icon = getThemeIcon(theme.icon);
                  return (
                    <DataTableRow key={theme.id} multiline>
                      <td className={DT.tdControl}>
                        <div className={DT.controlInner}>
                          <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                        </div>
                      </td>
                      <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                        <span className={DT.tdTextSpan}>{theme.name}</span>
                      </td>
                      <td className={DT.tdClipInset}>
                        <span className={DT.tdTextSpan}>{formatUiLabel(theme.appearance)}</span>
                      </td>
                      {renderRotationCell(theme)}
                      <td className={DT.tdControl}>
                        <div className={DT.controlInner}>
                          <button type="button" className={BUTTON.rejectCompact} onClick={() => handleRemove(theme.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </DataTableRow>
                  );
                })}
              </DataTableBody>
            </DataTable>
          </DataTableShell>
        )}
      </section>

      <AddThemeModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
