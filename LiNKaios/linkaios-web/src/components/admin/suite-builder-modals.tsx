"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Pencil } from "lucide-react";

import { InsetSelect } from "@/components/forms";
import {
  ISSUE_DEPENDENCY_TYPE_LABELS,
  listSuiteIssues,
  listSuiteModules,
  listSuitePhases,
  PHASE_CONCURRENCY_LABELS,
  SUITE_LINKBOT_ROLE_PRESETS,
  type SuiteAutomationUpsert,
  type SuiteCompositionUpsert,
  type SuiteIssueUpsert,
  type SuiteLinkbotUpsert,
  type SuiteModuleUpsert,
  type SuitePhaseUpsert,
} from "@/lib/suite-composition";
import type {
  IssueDependency,
  IssueDependencyType,
  ModuleIssueTemplate,
  ModulePhaseTemplate,
  ModuleProcess,
  PhaseConcurrency,
} from "@/lib/ui-mocks/modules-catalog-demo";
import { BUTTON, FIELD, FORM } from "@/lib/ui-standards";

type ModalShellProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
};

function ModalShell(props: ModalShellProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (props.open) closeRef.current?.focus();
  }, [props.open]);

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 dark:bg-black/60"
        aria-label="Close dialog"
        onClick={props.onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[min(90dvh,calc(100dvh-2rem))] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {props.title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={props.onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="mt-4 space-y-4">{props.children}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">{props.footer}</div>
      </div>
    </div>
  );
}

function ContractFields(props: {
  inputContract: string;
  outputContract: string;
  onInputChange: (v: string) => void;
  onOutputChange: (v: string) => void;
  optional?: boolean;
}) {
  return (
    <>
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>
          Input contract{props.optional ? " (optional)" : ""}
        </span>
        <textarea
          value={props.inputContract}
          onChange={(e) => props.onInputChange(e.target.value)}
          className={`min-h-[4rem] w-full ${FIELD.control}`}
          placeholder="Artifacts and leases required to start"
          required={!props.optional}
        />
      </label>
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>
          Output contract{props.optional ? " (optional)" : ""}
        </span>
        <textarea
          value={props.outputContract}
          onChange={(e) => props.onOutputChange(e.target.value)}
          className={`min-h-[4rem] w-full ${FIELD.control}`}
          placeholder="Artifacts and audit events produced"
          required={!props.optional}
        />
      </label>
    </>
  );
}

function InstructionMdUpload(props: {
  fileName: string | undefined;
  onLoad: (fileName: string, content: string) => void;
  onClear: () => void;
}) {
  return (
    <div className={`block ${FORM.fieldStack}`}>
      <span className={FIELD.label}>Executor instructions (.md, optional)</span>
      <input
        type="file"
        accept=".md,text/markdown"
        className={`w-full text-xs ${FIELD.control}`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          void file.text().then((content) => props.onLoad(file.name, content));
        }}
      />
      {props.fileName ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Attached · {props.fileName}{" "}
          <button type="button" className="text-rose-600 underline" onClick={props.onClear}>
            Remove
          </button>
        </p>
      ) : (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Upload Markdown guidance for the issue executor.
        </p>
      )}
    </div>
  );
}

function DependencyEditor(props: {
  modules: ModuleProcess[];
  issueId: string | undefined;
  dependencies: IssueDependency[];
  onChange: (deps: IssueDependency[]) => void;
}) {
  const candidates = listSuiteIssues(props.modules).filter((row) => row.id !== props.issueId);

  const addRow = () => {
    const first = candidates[0];
    if (!first) return;
    props.onChange([
      ...props.dependencies,
      { dependsOnIssueId: first.id, dependencyType: "blocked_by" },
    ]);
  };

  if (candidates.length === 0) {
    return (
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Add another issue first to configure cross-issue dependencies.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className={FIELD.label}>Dependencies</span>
        <button type="button" className={`${BUTTON.secondaryCardAction} !mt-0 px-2 py-1 text-xs`} onClick={addRow}>
          Add dependency
        </button>
      </div>
      {props.dependencies.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">No dependencies — issue can run when phase is ready.</p>
      ) : (
        <ul className="space-y-2">
          {props.dependencies.map((dep, index) => (
            <li key={`${dep.dependsOnIssueId}-${index}`} className="flex flex-wrap items-end gap-2">
              <label className="min-w-[10rem] flex-1 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Depends on issue</span>
                <InsetSelect
                  compact
                  value={dep.dependsOnIssueId}
                  onChange={(e) => {
                    const next = [...props.dependencies];
                    next[index] = { ...dep, dependsOnIssueId: e.target.value };
                    props.onChange(next);
                  }}
                >
                  {candidates.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.moduleName} · {row.phaseName} · {row.title}
                    </option>
                  ))}
                </InsetSelect>
              </label>
              <label className="min-w-[10rem] flex-1 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Rule</span>
                <InsetSelect
                  compact
                  value={dep.dependencyType}
                  onChange={(e) => {
                    const next = [...props.dependencies];
                    next[index] = { ...dep, dependencyType: e.target.value as IssueDependencyType };
                    props.onChange(next);
                  }}
                >
                  {(Object.keys(ISSUE_DEPENDENCY_TYPE_LABELS) as IssueDependencyType[]).map((key) => (
                    <option key={key} value={key}>
                      {ISSUE_DEPENDENCY_TYPE_LABELS[key]}
                    </option>
                  ))}
                </InsetSelect>
              </label>
              <button
                type="button"
                className="rounded px-2 py-1.5 text-xs text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                onClick={() => props.onChange(props.dependencies.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SuiteModuleModal(props: {
  open: boolean;
  modules: ModuleProcess[];
  initial?: ModuleProcess;
  onClose: () => void;
  onSave: (upsert: SuiteModuleUpsert) => void;
}) {
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [inputContract, setInputContract] = useState("");
  const [outputContract, setOutputContract] = useState("");
  const [dependsOnModuleIds, setDependsOnModuleIds] = useState<string[]>([]);
  const [rerunsAutomatically, setRerunsAutomatically] = useState(false);

  useEffect(() => {
    if (!props.open) return;
    setName(props.initial?.name ?? "");
    setSummary(props.initial?.summary ?? "");
    setInputContract(props.initial?.inputContract ?? "");
    setOutputContract(props.initial?.outputContract ?? "");
    setDependsOnModuleIds(props.initial?.dependsOnModuleIds ?? []);
    setRerunsAutomatically(props.initial?.rerunsAutomatically ?? false);
  }, [props.open, props.initial]);

  const moduleOptions = listSuiteModules(props.modules).filter((m) => m.id !== props.initial?.id);

  return (
    <ModalShell
      open={props.open}
      title={props.initial ? "Edit module" : "Add module"}
      onClose={props.onClose}
      footer={
        <>
          <button type="button" className={BUTTON.secondaryRow} onClick={props.onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={BUTTON.primaryRow}
            onClick={() =>
              props.onSave({
                kind: "module",
                id: props.initial?.id,
                name,
                summary,
                inputContract,
                outputContract,
                dependsOnModuleIds,
                rerunsAutomatically,
              })
            }
          >
            Save module
          </button>
        </>
      }
    >
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={FIELD.control} required />
      </label>
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Description</span>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className={`min-h-[4rem] w-full ${FIELD.control}`} />
      </label>
      <ContractFields
        optional
        inputContract={inputContract}
        outputContract={outputContract}
        onInputChange={setInputContract}
        onOutputChange={setOutputContract}
      />
      {moduleOptions.length > 0 ? (
        <label className={`block ${FORM.fieldStack}`}>
          <span className={FIELD.label}>Depends on modules (optional)</span>
          <select
            multiple
            value={dependsOnModuleIds}
            onChange={(e) =>
              setDependsOnModuleIds(Array.from(e.target.selectedOptions, (o) => o.value))
            }
            className={`min-h-[5rem] w-full ${FIELD.control}`}
          >
            {moduleOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={rerunsAutomatically}
          onChange={(e) => setRerunsAutomatically(e.target.checked)}
        />
        Continuous run (repeats for each project run)
      </label>
    </ModalShell>
  );
}

export function SuitePhaseModal(props: {
  open: boolean;
  modules: ModuleProcess[];
  initial?: ModulePhaseTemplate & { moduleId: string };
  defaultModuleId?: string;
  onClose: () => void;
  onSave: (upsert: SuitePhaseUpsert) => void;
}) {
  const [moduleId, setModuleId] = useState("");
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [inputContract, setInputContract] = useState("");
  const [outputContract, setOutputContract] = useState("");
  const [concurrency, setConcurrency] = useState<PhaseConcurrency>("sequential");
  const [dependsOnPhaseIds, setDependsOnPhaseIds] = useState<string[]>([]);

  useEffect(() => {
    if (!props.open) return;
    setModuleId(props.initial?.moduleId ?? props.defaultModuleId ?? listSuiteModules(props.modules)[0]?.id ?? "");
    setName(props.initial?.name ?? "");
    setSummary(props.initial?.summary ?? "");
    setInputContract(props.initial?.inputContract ?? "");
    setOutputContract(props.initial?.outputContract ?? "");
    setConcurrency(props.initial?.concurrency ?? "sequential");
    setDependsOnPhaseIds(props.initial?.dependsOnPhaseIds ?? []);
  }, [props.open, props.initial, props.defaultModuleId, props.modules]);

  const phaseOptions = listSuitePhases(props.modules).filter(
    (p) => p.moduleId === moduleId && p.id !== props.initial?.id,
  );

  return (
    <ModalShell
      open={props.open}
      title={props.initial ? "Edit phase" : "Add phase"}
      onClose={props.onClose}
      footer={
        <>
          <button type="button" className={BUTTON.secondaryRow} onClick={props.onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={BUTTON.primaryRow}
            disabled={!moduleId}
            onClick={() =>
              props.onSave({
                kind: "phase",
                id: props.initial?.id,
                moduleId,
                name,
                summary,
                inputContract,
                outputContract,
                concurrency,
                dependsOnPhaseIds,
              })
            }
          >
            Save phase
          </button>
        </>
      }
    >
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Parent module</span>
        <InsetSelect compact value={moduleId} onChange={(e) => setModuleId(e.target.value)} disabled={Boolean(props.initial)}>
          <option value="">Select module…</option>
          {listSuiteModules(props.modules).map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </InsetSelect>
      </label>
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={FIELD.control} required />
      </label>
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Description</span>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className={`min-h-[4rem] w-full ${FIELD.control}`} />
      </label>
      <ContractFields
        optional
        inputContract={inputContract}
        outputContract={outputContract}
        onInputChange={setInputContract}
        onOutputChange={setOutputContract}
      />
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Concurrency</span>
        <InsetSelect compact value={concurrency} onChange={(e) => setConcurrency(e.target.value as PhaseConcurrency)}>
          {(Object.keys(PHASE_CONCURRENCY_LABELS) as PhaseConcurrency[]).map((key) => (
            <option key={key} value={key}>
              {PHASE_CONCURRENCY_LABELS[key]}
            </option>
          ))}
        </InsetSelect>
      </label>
      {phaseOptions.length > 0 ? (
        <label className={`block ${FORM.fieldStack}`}>
          <span className={FIELD.label}>Depends on phases (optional)</span>
          <select
            multiple
            value={dependsOnPhaseIds}
            onChange={(e) =>
              setDependsOnPhaseIds(Array.from(e.target.selectedOptions, (o) => o.value))
            }
            className={`min-h-[5rem] w-full ${FIELD.control}`}
          >
            {phaseOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </ModalShell>
  );
}

export function SuiteIssueModal(props: {
  open: boolean;
  modules: ModuleProcess[];
  initial?: ModuleIssueTemplate & { moduleId: string; phaseId: string };
  defaultModuleId?: string;
  defaultPhaseId?: string;
  onClose: () => void;
  onSave: (upsert: SuiteIssueUpsert) => void;
}) {
  const [moduleId, setModuleId] = useState("");
  const [phaseId, setPhaseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [inputContract, setInputContract] = useState("");
  const [outputContract, setOutputContract] = useState("");
  const [dependencies, setDependencies] = useState<IssueDependency[]>([]);
  const [instructionMd, setInstructionMd] = useState<string | undefined>();
  const [instructionMdFileName, setInstructionMdFileName] = useState<string | undefined>();

  useEffect(() => {
    if (!props.open) return;
    const defaultMod = props.initial?.moduleId ?? props.defaultModuleId ?? listSuiteModules(props.modules)[0]?.id ?? "";
    setModuleId(defaultMod);
    const phases = listSuitePhases(props.modules).filter((p) => p.moduleId === defaultMod);
    setPhaseId(props.initial?.phaseId ?? props.defaultPhaseId ?? phases[0]?.id ?? "");
    setTitle(props.initial?.title ?? "");
    setDescription(props.initial?.description ?? "");
    setInputContract(props.initial?.inputContract ?? "");
    setOutputContract(props.initial?.outputContract ?? "");
    setDependencies(props.initial?.dependencies ?? []);
    setInstructionMd(props.initial?.instructionMd);
    setInstructionMdFileName(props.initial?.instructionMdFileName);
  }, [props.open, props.initial, props.defaultModuleId, props.defaultPhaseId, props.modules]);

  const phaseOptions = listSuitePhases(props.modules).filter((p) => p.moduleId === moduleId);

  return (
    <ModalShell
      open={props.open}
      title={props.initial ? "Edit issue" : "Add issue"}
      onClose={props.onClose}
      footer={
        <>
          <button type="button" className={BUTTON.secondaryRow} onClick={props.onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={BUTTON.primaryRow}
            disabled={!moduleId || !phaseId || !title.trim()}
            onClick={() =>
              props.onSave({
                kind: "issue",
                id: props.initial?.id,
                moduleId,
                phaseId,
                title,
                description,
                inputContract,
                outputContract,
                dependencies,
                instructionMd,
                instructionMdFileName,
              })
            }
          >
            Save issue
          </button>
        </>
      }
    >
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Parent module</span>
        <InsetSelect
          compact
          value={moduleId}
          onChange={(e) => {
            setModuleId(e.target.value);
            const firstPhase = listSuitePhases(props.modules).find((p) => p.moduleId === e.target.value);
            setPhaseId(firstPhase?.id ?? "");
          }}
          disabled={Boolean(props.initial)}
        >
          <option value="">Select module…</option>
          {listSuiteModules(props.modules).map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </InsetSelect>
      </label>
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Parent phase</span>
        <InsetSelect compact value={phaseId} onChange={(e) => setPhaseId(e.target.value)} disabled={Boolean(props.initial)}>
          <option value="">Select phase…</option>
          {phaseOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </InsetSelect>
      </label>
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={FIELD.control} required />
      </label>
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Description</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`min-h-[4rem] w-full ${FIELD.control}`} />
      </label>
      <ContractFields
        inputContract={inputContract}
        outputContract={outputContract}
        onInputChange={setInputContract}
        onOutputChange={setOutputContract}
      />
      <DependencyEditor
        modules={props.modules}
        issueId={props.initial?.id}
        dependencies={dependencies}
        onChange={setDependencies}
      />
      <InstructionMdUpload
        fileName={instructionMdFileName}
        onLoad={(fileName, content) => {
          setInstructionMdFileName(fileName);
          setInstructionMd(content);
        }}
        onClear={() => {
          setInstructionMd(undefined);
          setInstructionMdFileName(undefined);
        }}
      />
    </ModalShell>
  );
}

function IssueTargetFields(props: {
  modules: ModuleProcess[];
  moduleId: string;
  phaseId: string;
  issueId: string;
  onModuleId: (v: string) => void;
  onPhaseId: (v: string) => void;
  onIssueId: (v: string) => void;
}) {
  const phaseOptions = listSuitePhases(props.modules).filter((p) => p.moduleId === props.moduleId);
  const issueOptions = (() => {
    const mod = props.modules.find((m) => m.id === props.moduleId);
    const phase = mod?.workflows.find((w) => w.id === props.phaseId);
    return phase?.issues ?? [];
  })();

  return (
    <>
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Target module</span>
        <InsetSelect compact value={props.moduleId} onChange={(e) => props.onModuleId(e.target.value)}>
          <option value="">Select module…</option>
          {listSuiteModules(props.modules).map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </InsetSelect>
      </label>
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Target phase</span>
        <InsetSelect compact value={props.phaseId} onChange={(e) => props.onPhaseId(e.target.value)} disabled={!props.moduleId}>
          <option value="">Select phase…</option>
          {phaseOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </InsetSelect>
      </label>
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Target issue</span>
        <InsetSelect compact value={props.issueId} onChange={(e) => props.onIssueId(e.target.value)} disabled={!props.phaseId}>
          <option value="">Select issue…</option>
          {issueOptions.map((i) => (
            <option key={i.id} value={i.id}>
              {i.title}
            </option>
          ))}
        </InsetSelect>
      </label>
    </>
  );
}

export function SuiteLinkbotModal(props: {
  open: boolean;
  modules: ModuleProcess[];
  onClose: () => void;
  onSave: (upsert: SuiteLinkbotUpsert) => void;
}) {
  const [moduleId, setModuleId] = useState("");
  const [phaseId, setPhaseId] = useState("");
  const [issueId, setIssueId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [roleId, setRoleId] = useState(SUITE_LINKBOT_ROLE_PRESETS[0]?.roleId ?? "");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!props.open) return;
    const firstMod = listSuiteModules(props.modules)[0]?.id ?? "";
    setModuleId(firstMod);
    const firstPhase = listSuitePhases(props.modules).find((p) => p.moduleId === firstMod);
    setPhaseId(firstPhase?.id ?? "");
    const mod = props.modules.find((m) => m.id === firstMod);
    const phase = mod?.workflows.find((w) => w.id === firstPhase?.id);
    setIssueId(phase?.issues[0]?.id ?? "");
    setDisplayName("");
    setRoleId(SUITE_LINKBOT_ROLE_PRESETS[0]?.roleId ?? "");
    setDescription("");
  }, [props.open, props.modules]);

  const selectedPreset = SUITE_LINKBOT_ROLE_PRESETS.find((p) => p.roleId === roleId);

  return (
    <ModalShell
      open={props.open}
      title="Add LiNKbot"
      onClose={props.onClose}
      footer={
        <>
          <button type="button" className={BUTTON.secondaryRow} onClick={props.onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={BUTTON.primaryRow}
            disabled={!moduleId || !phaseId || !issueId || !displayName.trim()}
            onClick={() =>
              props.onSave({
                kind: "linkbot",
                moduleId,
                phaseId,
                issueId,
                displayName,
                roleId,
                description: description || selectedPreset?.description,
              })
            }
          >
            Add LiNKbot
          </button>
        </>
      }
    >
      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        Choose a display name and role profile, then bind the LiNKbot to a governed issue — same flow as fleet provisioning, scoped to suite composition.
      </p>
      <IssueTargetFields
        modules={props.modules}
        moduleId={moduleId}
        phaseId={phaseId}
        issueId={issueId}
        onModuleId={(v) => {
          setModuleId(v);
          const firstPhase = listSuitePhases(props.modules).find((p) => p.moduleId === v);
          setPhaseId(firstPhase?.id ?? "");
          const mod = props.modules.find((m) => m.id === v);
          const phase = mod?.workflows.find((w) => w.id === firstPhase?.id);
          setIssueId(phase?.issues[0]?.id ?? "");
        }}
        onPhaseId={(v) => {
          setPhaseId(v);
          const mod = props.modules.find((m) => m.id === moduleId);
          const phase = mod?.workflows.find((w) => w.id === v);
          setIssueId(phase?.issues[0]?.id ?? "");
        }}
        onIssueId={setIssueId}
      />
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Display name</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={FIELD.control}
          placeholder="e.g. Website Scout"
          required
        />
      </label>
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Role profile</span>
        <InsetSelect
          compact
          value={roleId}
          onChange={(e) => {
            setRoleId(e.target.value);
            const preset = SUITE_LINKBOT_ROLE_PRESETS.find((p) => p.roleId === e.target.value);
            if (preset && !displayName.trim()) setDisplayName(preset.label);
          }}
        >
          {SUITE_LINKBOT_ROLE_PRESETS.map((preset) => (
            <option key={preset.roleId} value={preset.roleId}>
              {preset.label}
            </option>
          ))}
        </InsetSelect>
      </label>
      {selectedPreset ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{selectedPreset.description}</p>
      ) : null}
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Session description (optional)</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`min-h-[3rem] w-full ${FIELD.control}`} />
      </label>
    </ModalShell>
  );
}

type AutomationJsonShape = {
  handle?: string;
  title?: string;
  description?: string;
};

export function SuiteAutomationModal(props: {
  open: boolean;
  modules: ModuleProcess[];
  onClose: () => void;
  onSave: (upsert: SuiteAutomationUpsert) => void;
}) {
  const [moduleId, setModuleId] = useState("");
  const [phaseId, setPhaseId] = useState("");
  const [issueId, setIssueId] = useState("");
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [jsonFileName, setJsonFileName] = useState<string | undefined>();
  const [automationJson, setAutomationJson] = useState<Record<string, unknown> | undefined>();
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    if (!props.open) return;
    const firstMod = listSuiteModules(props.modules)[0]?.id ?? "";
    setModuleId(firstMod);
    const firstPhase = listSuitePhases(props.modules).find((p) => p.moduleId === firstMod);
    setPhaseId(firstPhase?.id ?? "");
    const mod = props.modules.find((m) => m.id === firstMod);
    const phase = mod?.workflows.find((w) => w.id === firstPhase?.id);
    setIssueId(phase?.issues[0]?.id ?? "");
    setTitle("");
    setHandle("");
    setDescription("");
    setJsonFileName(undefined);
    setAutomationJson(undefined);
    setParseError(null);
  }, [props.open, props.modules]);

  const applyJson = (fileName: string, raw: string) => {
    try {
      const parsed = JSON.parse(raw) as AutomationJsonShape & Record<string, unknown>;
      setAutomationJson(parsed);
      setJsonFileName(fileName);
      setParseError(null);
      if (typeof parsed.title === "string") setTitle(parsed.title);
      if (typeof parsed.handle === "string") setHandle(parsed.handle);
      if (typeof parsed.description === "string") setDescription(parsed.description);
    } catch {
      setParseError("Invalid JSON — upload a LiNKautowork workflow definition file.");
      setAutomationJson(undefined);
      setJsonFileName(undefined);
    }
  };

  return (
    <ModalShell
      open={props.open}
      title="Add automation"
      onClose={props.onClose}
      footer={
        <>
          <button type="button" className={BUTTON.secondaryRow} onClick={props.onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={BUTTON.primaryRow}
            disabled={!moduleId || !phaseId || !issueId || !title.trim() || !handle.trim()}
            onClick={() =>
              props.onSave({
                kind: "automation",
                moduleId,
                phaseId,
                issueId,
                title,
                handle,
                description,
                automationJson,
              })
            }
          >
            Add automation
          </button>
        </>
      }
    >
      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        Upload a LiNKautowork workflow JSON or enter handle details manually, then bind to an issue assignee slot.
      </p>
      <IssueTargetFields
        modules={props.modules}
        moduleId={moduleId}
        phaseId={phaseId}
        issueId={issueId}
        onModuleId={(v) => {
          setModuleId(v);
          const firstPhase = listSuitePhases(props.modules).find((p) => p.moduleId === v);
          setPhaseId(firstPhase?.id ?? "");
          const mod = props.modules.find((m) => m.id === v);
          const phase = mod?.workflows.find((w) => w.id === firstPhase?.id);
          setIssueId(phase?.issues[0]?.id ?? "");
        }}
        onPhaseId={(v) => {
          setPhaseId(v);
          const mod = props.modules.find((m) => m.id === moduleId);
          const phase = mod?.workflows.find((w) => w.id === v);
          setIssueId(phase?.issues[0]?.id ?? "");
        }}
        onIssueId={setIssueId}
      />
      <div className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Workflow JSON (optional)</span>
        <input
          type="file"
          accept=".json,application/json"
          className={`w-full text-xs ${FIELD.control}`}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            void file.text().then((content) => applyJson(file.name, content));
          }}
        />
        {jsonFileName ? (
          <p className="text-xs text-emerald-700 dark:text-emerald-300">Loaded · {jsonFileName}</p>
        ) : null}
        {parseError ? <p className="text-xs text-rose-700 dark:text-rose-300">{parseError}</p> : null}
      </div>
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={FIELD.control} required />
      </label>
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Workflow handle</span>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className={`font-mono text-sm ${FIELD.control}`}
          placeholder="autowork.linksites.artifact_write_local"
          required
        />
      </label>
      <label className={`block ${FORM.fieldStack}`}>
        <span className={FIELD.label}>Description</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`min-h-[3rem] w-full ${FIELD.control}`} />
      </label>
    </ModalShell>
  );
}

export function SuiteBuilderEditButton(props: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      onClick={(e) => {
        e.stopPropagation();
        props.onClick();
      }}
      aria-label={props.label}
    >
      <Pencil className="h-3 w-3" aria-hidden />
      Edit
    </button>
  );
}

export type SuiteBuilderModalState =
  | { kind: "closed" }
  | { kind: "module"; initial?: ModuleProcess }
  | { kind: "phase"; initial?: ModulePhaseTemplate & { moduleId: string }; defaultModuleId?: string }
  | { kind: "issue"; initial?: ModuleIssueTemplate & { moduleId: string; phaseId: string } }
  | { kind: "linkbot" }
  | { kind: "automation" };

export function useSuiteBuilderModals(onSave: (upsert: SuiteCompositionUpsert) => { ok: boolean; reason?: string }) {
  const [state, setState] = useState<SuiteBuilderModalState>({ kind: "closed" });
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => {
    setState({ kind: "closed" });
    setError(null);
  }, []);

  const save = useCallback(
    (upsert: SuiteCompositionUpsert) => {
      const result = onSave(upsert);
      if (!result.ok) {
        setError(result.reason ?? "Could not save.");
        return;
      }
      close();
    },
    [onSave, close],
  );

  return { state, setState, error, close, save };
}
