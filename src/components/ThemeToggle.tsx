"use client";

import type { MouseEvent } from "react";
import { MoonIcon, SunIcon } from "./Icons";

function applyTheme(next: "light" | "dark") {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // 저장소를 못 써도 현재 화면에서는 바뀐 테마가 유지된다.
  }
}

// 실제 테마는 <html data-theme>에 있고, 아이콘은 CSS가 테마에 맞춰 하나만 보여준다.
export default function ThemeToggle() {
  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || reduceMotion) {
      applyTheme(next);
      return;
    }

    // 버튼 중심에서 화면 가장 먼 모서리까지 원을 키워 새 테마를 드러낸다.
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => applyTheme(next));
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
      );
    });
  };

  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label="다크 모드 전환" title="다크 모드 전환">
      <SunIcon className="theme-icon-sun" />
      <MoonIcon className="theme-icon-moon" />
    </button>
  );
}
