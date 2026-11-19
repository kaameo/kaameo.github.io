import type { ReactNode } from "react";

// className은 그 그림의 CSS Module 클래스다. 틀(.figure) 위에 그림 안쪽 스타일을 얹을 때 쓴다.
type Props = { title: string; caption?: ReactNode; className?: string; children: ReactNode };

// 글 폴더에서 직접 그린 그림을 감싸는 틀. 테두리·제목·설명 문구를 모든 그림에서 같게 맞춘다.
// 제목과 설명은 SVG 밖 HTML에 둬서, 좁은 화면에서도 글자가 작아지지 않고 줄을 바꾼다.
export default function Figure({ title, caption, className, children }: Props) {
  return (
    <figure className={className ? `figure ${className}` : "figure"}>
      <figcaption className="figure-title">{title}</figcaption>
      {children}
      {caption && <p className="figure-note">{caption}</p>}
    </figure>
  );
}
