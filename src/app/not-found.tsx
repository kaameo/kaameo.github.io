import Link from "next/link";

export default function NotFound() {
  return (
    <div className="notfound">
      <p className="notfound-code">404</p>
      <h1>페이지를 찾을 수 없습니다</h1>
      <p>주소가 바뀌었거나 삭제된 페이지일 수 있습니다.</p>
      <div className="notfound-actions">
        <Link href="/" className="btn-solid">
          Home으로
        </Link>
        <Link href="/posts/" className="btn-ghost">
          글 목록 보기
        </Link>
      </div>
    </div>
  );
}
