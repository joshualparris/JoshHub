"use client";
import React from "react";
import useHydrated from "./useHydrated";

export function ClientOnly({ children, placeholder = null }: { children: React.ReactNode; placeholder?: React.ReactNode | null }) {
  const hydrated = useHydrated();
  if (!hydrated) return placeholder as any;
  return <>{children}</>;
}

export default ClientOnly;
