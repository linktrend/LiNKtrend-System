import * as React from "react";
import { type VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import { BUTTON } from "@/lib/ui-standards";
import { cn } from "@/lib/utils";

export type ButtonToken = keyof typeof BUTTON;

type ShadcnVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
type ShadcnSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

/** Semantic aliases documented in `docs/ui-system.md` → underlying `BUTTON` token. */
export type UiButtonVariant =
  | ShadcnVariant
  | "approve"
  | "approve-outline"
  | "add"
  | "edit"
  | "warning"
  | "destructive-outline";

export const UI_BUTTON_VARIANT_ALIASES: Partial<Record<UiButtonVariant, ButtonToken>> = {
  approve: "approveRow",
  "approve-outline": "approveOutlineRow",
  add: "addRow",
  edit: "editRow",
  warning: "dangerRow",
  "destructive-outline": "rejectOutlineRow",
};

type BridgeEntry = {
  /** shadcn `Button` variant when not using full legacy styling */
  variant: ShadcnVariant;
  size: ShadcnSize;
  /** Apply the full `BUTTON.*` class string for pixel parity (LiNKtrend semantic colors). */
  useLegacyClass?: boolean;
};

/**
 * Maps each legacy `BUTTON` token to shadcn `variant` + `size`.
 * Tokens with LiNKtrend-specific fills/outlines set `useLegacyClass` until custom cva variants land in W5.
 */
export const BUTTON_BRIDGE_MAP: Record<ButtonToken, BridgeEntry> = {
  primaryRow: { variant: "default", size: "lg", useLegacyClass: true },
  primaryRowUniform: { variant: "default", size: "lg", useLegacyClass: true },
  primaryBlock: { variant: "default", size: "lg", useLegacyClass: true },
  secondaryRow: { variant: "outline", size: "lg", useLegacyClass: true },
  secondaryRowUniform: { variant: "outline", size: "lg", useLegacyClass: true },
  secondaryCardAction: { variant: "outline", size: "lg", useLegacyClass: true },
  secondaryBlock: { variant: "outline", size: "lg", useLegacyClass: true },
  ghostRow: { variant: "ghost", size: "lg", useLegacyClass: true },
  ghostBlock: { variant: "ghost", size: "lg", useLegacyClass: true },
  dangerRow: { variant: "outline", size: "lg", useLegacyClass: true },
  dangerBlock: { variant: "outline", size: "lg", useLegacyClass: true },
  approveRow: { variant: "default", size: "lg", useLegacyClass: true },
  rejectRow: { variant: "destructive", size: "lg", useLegacyClass: true },
  approveCompact: { variant: "default", size: "sm", useLegacyClass: true },
  rejectCompact: { variant: "destructive", size: "sm", useLegacyClass: true },
  primaryCompact: { variant: "default", size: "sm", useLegacyClass: true },
  secondaryCompact: { variant: "outline", size: "sm", useLegacyClass: true },
  editRow: { variant: "outline", size: "lg", useLegacyClass: true },
  approveOutlineRow: { variant: "outline", size: "lg", useLegacyClass: true },
  rejectOutlineRow: { variant: "destructive", size: "lg", useLegacyClass: true },
  addRow: { variant: "outline", size: "lg", useLegacyClass: true },
  editTextLink: { variant: "link", size: "default", useLegacyClass: true },
  editCompact: { variant: "outline", size: "sm", useLegacyClass: true },
  editTight: { variant: "outline", size: "sm", useLegacyClass: true },
  primaryTight: { variant: "default", size: "sm", useLegacyClass: true },
  secondaryTight: { variant: "outline", size: "sm", useLegacyClass: true },
  ghostTight: { variant: "ghost", size: "sm", useLegacyClass: true },
};

export function resolveButtonBridge(buttonKey: ButtonToken): BridgeEntry {
  return BUTTON_BRIDGE_MAP[buttonKey];
}

function resolveBridgeFromVariant(variant: UiButtonVariant): BridgeEntry | undefined {
  const token = UI_BUTTON_VARIANT_ALIASES[variant];
  return token ? BUTTON_BRIDGE_MAP[token] : undefined;
}

function isShadcnVariant(variant: UiButtonVariant): variant is ShadcnVariant {
  return !(variant in UI_BUTTON_VARIANT_ALIASES);
}

export type UiButtonProps = Omit<React.ComponentProps<typeof Button>, "variant" | "size"> & {
  /** Legacy `BUTTON.*` key — preferred during incremental migration. */
  buttonKey?: ButtonToken;
  variant?: UiButtonVariant;
  size?: ShadcnSize;
};

/**
 * Bridge from legacy `BUTTON.*` tokens to shadcn `Button`.
 * Pass `buttonKey` for mapped variant/size, or keep `className={BUTTON.*}` for drop-in parity.
 */
export function UiButton({
  buttonKey,
  variant,
  size,
  className,
  ...props
}: UiButtonProps) {
  const bridgeFromKey = buttonKey ? BUTTON_BRIDGE_MAP[buttonKey] : undefined;
  const bridgeFromVariant = variant ? resolveBridgeFromVariant(variant) : undefined;
  const bridge = bridgeFromKey ?? bridgeFromVariant;

  const resolvedVariant: ShadcnVariant =
    (variant && isShadcnVariant(variant) ? variant : undefined) ??
    bridge?.variant ??
    "default";

  const resolvedSize: ShadcnSize = size ?? bridge?.size ?? "default";

  const legacyToken =
    buttonKey ??
    (variant ? UI_BUTTON_VARIANT_ALIASES[variant] : undefined);

  const legacyClass =
    legacyToken && (bridgeFromKey?.useLegacyClass ?? bridgeFromVariant?.useLegacyClass ?? false)
      ? BUTTON[legacyToken]
      : undefined;

  return (
    <Button
      variant={resolvedVariant}
      size={resolvedSize}
      className={cn(legacyClass, className)}
      {...props}
    />
  );
}
