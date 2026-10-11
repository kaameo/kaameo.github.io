"use client";

import { PrinterIcon } from "./Icons";

export default function PrintButton() {
  return (
    <button type="button" className="icon-btn no-print" onClick={() => window.print()} aria-label="인쇄" title="인쇄">
      <PrinterIcon />
    </button>
  );
}
