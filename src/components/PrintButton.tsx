"use client";

import { PrinterIcon } from "./Icons";

export default function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className="btn no-print" onClick={() => window.print()}>
      <PrinterIcon />
      {label}
    </button>
  );
}
