// Resume 페이지 내용. [대괄호]로 된 값은 실제 내용으로 바꿔 주세요.
export const resume = {
  name: "kaameo",
  intro: "[한 줄 소개: 어떤 문제를 풀어온 개발자인지]",
  experience: [
    {
      company: "[회사명]",
      period: "[2024.03] – 현재",
      role: "[직무] · [팀]",
      items: ["[맡은 일과 결과를 숫자로. 예: 주문 API 응답 시간 40% 단축]", "[맡은 일과 결과]", "[맡은 일과 결과]"],
    },
    {
      company: "[회사명]",
      period: "[2022.01] – [2024.02]",
      role: "[직무] · [팀]",
      items: ["[맡은 일과 결과]", "[맡은 일과 결과]"],
    },
  ],
  skills: [
    { group: "Backend", items: ["Java", "Spring Boot", "JPA", "PostgreSQL"] },
    { group: "Frontend", items: ["TypeScript", "React", "Next.js"] },
    { group: "DevOps", items: ["Docker", "GitHub Actions"] },
  ],
  projects: [
    { title: "kaameo.log", description: "글, 이력서, 포트폴리오를 한곳에 모은 개인 사이트" },
    { title: "가계부 API", description: "카드 결제 문자를 파싱해 지출을 분류하는 REST API 서버" },
  ],
  education: [{ school: "[학교명] · [전공]", period: "[2016.03] – [2022.02]" }],
};
