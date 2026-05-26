"use client";

import { createContext, useContext, useMemo } from "react";

import {
  appBasePath,
  stripAppBasePath,
  withAppBasePath,
  type AppSurface,
} from "@/lib/app-surface";

type AppSurfaceContextValue = {
  surface: AppSurface;
  basePath: string;
  /** Prefix a licensee-relative path for the current surface. */
  href: (path: string) => string;
  /** Strip `/admin` for route matching against nav helpers. */
  routePath: (pathname: string) => string;
  isAdmin: boolean;
};

const AppSurfaceContext = createContext<AppSurfaceContextValue | null>(null);

export function AppSurfaceProvider(props: { surface: AppSurface; children: React.ReactNode }) {
  const value = useMemo((): AppSurfaceContextValue => {
    const basePath = appBasePath(props.surface);
    return {
      surface: props.surface,
      basePath,
      href: (path: string) => withAppBasePath(path, props.surface),
      routePath: stripAppBasePath,
      isAdmin: props.surface === "admin",
    };
  }, [props.surface]);

  return <AppSurfaceContext.Provider value={value}>{props.children}</AppSurfaceContext.Provider>;
}

export function useAppSurface(): AppSurfaceContextValue {
  const ctx = useContext(AppSurfaceContext);
  if (!ctx) {
    return {
      surface: "licensee",
      basePath: "",
      href: (path: string) => withAppBasePath(path, "licensee"),
      routePath: stripAppBasePath,
      isAdmin: false,
    };
  }
  return ctx;
}
