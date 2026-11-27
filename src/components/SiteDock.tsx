import { site } from "@/lib/site";
import { GitHubIcon } from "./Icons";
import PrintButton from "./PrintButton";
import ThemeToggle from "./ThemeToggle";

// 화면 오른쪽 아래에 떠 있는 도구 막대: 인쇄, GitHub, 다크 모드 버튼. 모든 페이지에 있고 인쇄에는 찍히지 않는다.
export default function SiteDock() {
  return (
    <div className="site-dock no-print">
      <PrintButton />
      <a href={site.github} className="icon-btn" aria-label="GitHub" title="GitHub">
        <GitHubIcon />
      </a>
      <ThemeToggle />
    </div>
  );
}
