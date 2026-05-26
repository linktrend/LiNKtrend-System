"use client";

import { useRef } from "react";
import { Upload, X } from "lucide-react";

import { BUTTON } from "@/lib/ui-standards";
import { cn } from "@/lib/utils";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FormFileUpload(props: {
  id: string;
  fileName?: string | null;
  fileSize?: number | null;
  accept?: string;
  hint?: string;
  describedBy?: string;
  invalid?: boolean;
  disabled?: boolean;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex min-w-0 items-center gap-3 rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-2.5 dark:border-zinc-600 dark:bg-zinc-950",
          props.invalid && "border-rose-500 dark:border-rose-500",
        )}
      >
        <button
          type="button"
          className={BUTTON.secondaryTight}
          disabled={props.disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" aria-hidden />
          Choose file
        </button>
        <span className="min-w-0 flex-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
          {props.fileName ?? "No file selected"}
          {props.fileName && props.fileSize ? ` · ${formatFileSize(props.fileSize)}` : null}
        </span>
        {props.fileName ? (
          <button
            type="button"
            className="rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Remove file"
            disabled={props.disabled}
            onClick={() => props.onChange(null)}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
        <input
          ref={inputRef}
          id={props.id}
          type="file"
          className="sr-only"
          accept={props.accept}
          aria-describedby={props.describedBy}
          aria-invalid={props.invalid || undefined}
          disabled={props.disabled}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            props.onChange(file);
            event.target.value = "";
          }}
        />
      </div>
      {props.hint ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{props.hint}</p> : null}
    </div>
  );
}
