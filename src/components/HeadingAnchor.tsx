"use client";

import { useEffect, useState, type ComponentProps, type MouseEvent } from "react";
import { LinkIcon } from "./Icons";

// 본문 h2에 마우스를 올리면 링크 아이콘이 보이고, 누르면 그 위치의 주소를 복사한다.
export default function HeadingAnchor({ id, children, ...rest }: ComponentProps<"h2">) {
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(false), 1600);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!id) return <h2 {...rest}>{children}</h2>;

  const copyLink = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const url = `${location.origin}${location.pathname}#${id}`;
    history.replaceState(null, "", `#${id}`);
    try {
      await navigator.clipboard.writeText(url);
      setToast(true);
    } catch {
      // 복사가 막혀도 주소창에는 #id가 붙어 있다.
    }
  };

  return (
    <>
      <h2 id={id} className="heading" {...rest}>
        {children}
        <a href={`#${id}`} className="h-anchor" onClick={copyLink} aria-label="이 섹션 링크 복사" title="링크 복사">
          <LinkIcon />
        </a>
      </h2>
      {toast && (
        <div role="status" className="toast">
          링크를 복사했어요
        </div>
      )}
    </>
  );
}
