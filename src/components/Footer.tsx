import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="site-footer no-print">
      <div className="container">
        © {new Date().getFullYear()} {site.title}
      </div>
    </footer>
  );
}
