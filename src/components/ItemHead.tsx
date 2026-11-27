import type { ElementType } from "react";
import ArrowLink from "@/components/ArrowLink";
import type { Link } from "@/data/projects";

// 이름 줄: 이름과 회색 부제는 왼쪽, 서비스·GitHub 같은 링크는 그 옆, 기간은 오른쪽 끝(폭이 좁으면 아래 줄).
// Resume의 회사·프로젝트·학력과 Portfolio 요약의 Project가 같은 모양을 쓴다.
// large는 아래 업무·Case 제목보다 확실히 크게 보여야 하는 이름(Resume의 회사·프로젝트, Portfolio의 Project)에 준다.
export default function ItemHead(props: {
  as: ElementType;
  title: string;
  subtitle: string;
  period: string;
  links?: Link[];
  large?: boolean;
}) {
  const { as: Heading, links } = props;
  return (
    <div className="item-head">
      <div className="item-title-line">
        <Heading className={props.large ? "item-name" : undefined}>
          {props.title}
          <span className="item-sub">{props.subtitle}</span>
        </Heading>
        {links && links.length > 0 && (
          <span className="item-links">
            {links.map((link) => (
              <ArrowLink key={link.href} href={link.href}>
                {link.label}
              </ArrowLink>
            ))}
          </span>
        )}
      </div>
      <span className="period">{props.period}</span>
    </div>
  );
}
