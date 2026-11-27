import type { ComponentProps } from "react";
import { ArrowIcon } from "./Icons";

// 끝에 작은 화살표가 붙는 링크(resume.html의 링크 모양). Resume·Portfolio의 프로젝트 링크와 Resume Summary 마크다운 링크에 쓴다.
export default function ArrowLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a {...props}>
      {children}
      <ArrowIcon />
    </a>
  );
}
