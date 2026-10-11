"use client";

import { MoonIcon, SunIcon } from "./Icons";

// 실제 테마는 <html data-theme>에 있고, 아이콘은 CSS가 테마에 맞춰 하나만 보여준다.
export default function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // 저장소를 못 써도 현재 화면에서는 바뀐 테마가 유지된다.
    }
  };

  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label="다크 모드 전환" title="다크 모드 전환">
      <SunIcon className="theme-icon-sun" />
      <MoonIcon className="theme-icon-moon" />
    </button>
  );
}
