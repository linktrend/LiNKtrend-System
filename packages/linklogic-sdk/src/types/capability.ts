import type {
  CapabilityPluginCaller,
  CapabilityPluginSurface,
  PluginMode,
} from "../contracts-mvo.js";

export type CapabilityMode = PluginMode;

export type CapabilityOperation = string;

export interface CapabilityCatalogEntry extends CapabilityPluginSurface {
  plugin_kind: "capability";
  version: number;
  created_at: string;
  updated_at: string;
}

export type CapabilityAllowedCaller = CapabilityPluginCaller;
