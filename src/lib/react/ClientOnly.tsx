"use client";
import React from "react";
import useHydrated from "./useHydrated";

interface ClientOnlyProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode | null;
}

export function ClientOnly({ children, placeholder = null }: ClientOnlyProps) {
  const hydrated = useHydrated();
  if (!hydrated) return <>{placeholder}</>;
  return <>{children}</>;
}

export default ClientOnly;
