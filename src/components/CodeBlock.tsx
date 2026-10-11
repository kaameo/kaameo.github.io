"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { CopyIcon } from "./Icons";

type Props = ComponentProps<"pre"> & { "data-language"?: string };

// rehype-pretty-code가 만든 <pre>를 감싸 언어 이름과 복사 버튼을 붙인다.
export default function CodeBlock({ children, ...rest }: Props) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const language = rest["data-language"];

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    const text = ref.current?.querySelector("code")?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // 클립보드 권한이 없으면 아무것도 하지 않는다.
    }
  };

  return (
    <div className="code-block">
      <div className="code-head">
        <span>{language && language !== "plaintext" ? language : "text"}</span>
        <button type="button" className="copy-btn" onClick={copy} aria-label="코드 복사">
          <CopyIcon />
          <span aria-live="polite">{copied ? "복사됨" : "복사"}</span>
        </button>
      </div>
      <pre ref={ref} {...rest}>
        {children}
      </pre>
    </div>
  );
}
