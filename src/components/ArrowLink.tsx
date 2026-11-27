import Link from "next/link";
import type { ComponentProps } from "react";
import { ArrowIcon } from "./Icons";

// 끝에 작은 화살표가 붙는 링크(resume.html의 링크 모양). Resume·Portfolio의 프로젝트 링크, Resume Summary 마크다운 링크,
// Resume의 "포트폴리오" 안내에 쓴다. 사이트 안 주소(/로 시작)는 next/link로 이동한다.
export default function ArrowLink({ children, href = "", ...props }: ComponentProps<"a">) {
  const content = (
    <>
      {children}
      <ArrowIcon />
    </>
  );
  return href.startsWith("/") ? (
    <Link href={href} {...props}>
      {content}
    </Link>
  ) : (
    <a href={href} {...props}>
      {content}
    </a>
  );
}
