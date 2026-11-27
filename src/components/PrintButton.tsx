"use client";

import { PrinterIcon } from "./Icons";

// 지금 페이지를 인쇄한다. 인쇄 창에서 "PDF로 저장"을 고르면 PDF가 된다. 오른쪽 아래 도구 막대(SiteDock)에 있다.
export default function PrintButton() {
  return (
    <button type="button" className="icon-btn" onClick={() => window.print()} aria-label="인쇄" title="인쇄">
      <PrinterIcon />
    </button>
  );
}
