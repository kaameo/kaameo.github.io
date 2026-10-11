// 사이트 전역 설정.
export const site = {
  title: "kaameo.log",
  url: "https://kaameo.github.io",
  author: "홍진수",
  description: "백엔드 배운 것들을 기록합니다.",
  github: "https://github.com/kaameo",
  email: "kaameo12@gmail.com",
  postsPerPage: 10,

  hero: {
    greeting: "안녕하세요, 홍진수입니다.",
    intro: "보안 로그 수집 플랫폼을 만들며 데이터 정합성과 장애 복구를 고민해 온 백엔드 엔지니어입니다. 요즘은 분산 시스템과 Kubernetes 운영에 관심이 많습니다.",
  },

  about: {
    body: "백엔드와 인프라를 함께 다루는 엔지니어입니다.",
    items: [
      { label: "Now", value: "백엔드 엔지니어로 새로운 기회를 찾고 있습니다." },
      { label: "Interests", value: "분산 시스템, 데이터 파이프라인, AI 도구를 활용한 개발 생산성" },
      { label: "Contact", value: "kaameo12@gmail.com", mono: true },
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
