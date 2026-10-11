// 사이트 전역 설정. [대괄호]로 된 값은 실제 내용으로 바꿔 주세요.
export const site = {
  title: "kaameo.log",
  url: "https://kaameo.github.io",
  author: "kaameo",
  description: "백엔드 배운 것들을 기록합니다.",
  github: "https://github.com/kaameo",
  email: "kaameo12@gmail.com",
  postsPerPage: 10,

  hero: {
    greeting: "안녕하세요, 홍진수입니다.",
    intro: "[한 줄 소개: 어떤 문제를 풀어온 개발자인지, 요즘 관심 있는 것]",
  },

  about: {
    body: "[자기소개 2~3문장: 어떤 개발자인지, 어떤 일을 할 때 즐거운지, 일할 때 중요하게 생각하는 것]",
    items: [
      { label: "Now", value: "[회사명]에서 [직무]로 일하고 있습니다." },
      { label: "Interests", value: "[요즘 관심 있는 기술이나 주제]" },
      { label: "Contact", value: "[email@example.com]", mono: true },
    ],
  },

  // GA4 측정 ID. 배포 워크플로가 저장소 secret에서 넣어 주고, 로컬 개발에서는 비어 있어 수집하지 않는다.
  gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",

  // 기존 블로그와 같은 giscus 설정. 글 주소(pathname)가 같으면 기존 댓글이 그대로 이어진다.
  giscus: {
    repo: "kaameo/kaameo.github.io" as `${string}/${string}`,
    repoId: "R_kgDOTjWb8A",
    category: "Announcements",
    categoryId: "DIC_kwDOTjWb8M4DB87H",
  },
};
