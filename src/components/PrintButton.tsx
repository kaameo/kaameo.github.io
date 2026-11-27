"use client";

import { PrinterIcon } from "./Icons";

// 지금 페이지를 인쇄한다. 인쇄 창에서 "PDF로 저장"을 고르면 PDF가 된다.
// 헤더의 GitHub·테마 버튼과 같은 아이콘 버튼이고, Resume·Portfolio·Case 제목 줄 오른쪽 끝에 둔다. 인쇄에는 찍히지 않는다.
export default function PrintButton() {
  return (
    <button type="button" className="icon-btn no-print" onClick={() => window.print()} aria-label="인쇄" title="인쇄">
      <PrinterIcon />
    </button>
  );
}
