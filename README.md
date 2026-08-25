# IRONWORKS FITNESS — 지역 헬스장 홍보 랜딩 페이지

지역 헬스장을 타깃으로 만든 **포트폴리오용 원페이지 랜딩 목업**입니다.
가상의 브랜드 "아이언웍스 피트니스(성수점)"를 소재로 가격표, 트레이너 소개, PT 예약 폼을 담았습니다.

빌드 도구나 패키지 설치 없이 순수 HTML / CSS / JavaScript로만 구성했습니다.

**데모: https://ironworks-mockup.seungdae33.workers.dev**

## 실행 방법

`index.html`을 브라우저로 열면 바로 확인할 수 있습니다.

로컬 서버로 띄우고 싶다면 아래 중 하나를 사용하세요.

```bash
# Python 3
python -m http.server 5500

# Node.js
npx serve .
```

## 구성

| 파일 | 설명 |
| --- | --- |
| `index.html` | 전체 마크업 (히어로 / 시설 / 가격표 / 트레이너 / 예약 폼 / 오시는 길) |
| `assets/css/style.css` | CSS 변수 기반 디자인 토큰과 전 섹션 스타일 |
| `assets/js/main.js` | 내비게이션, 탭, 등장 애니메이션, 폼 검증, 완료 모달 |
| `assets/img/` | 히어로, 트레이너 4명, OG 공유용 이미지 |
| `404.html` | 없는 경로로 들어왔을 때 보여주는 안내 페이지 |
| `_headers` | Cloudflare Pages 캐시 · 보안 헤더 설정 |
| `robots.txt` | 검색 색인 차단 (아래 배포 항목 참고) |

## 주요 기능

- **스티키 헤더** — 스크롤 시 배경 전환, 현재 섹션 자동 하이라이트, 모바일 햄버거 메뉴
- **히어로** — 센터 현황 숫자 카운트업 애니메이션
- **가격표** — 헬스 회원권 / 1:1 PT 패키지 탭 전환 (키보드 좌우 방향키 지원), 추천 플랜 강조
- **트레이너 카드** — 카드의 예약 버튼을 누르면 예약 폼의 희망 트레이너가 자동 선택됩니다
- **가격 카드** — 상담받기 버튼을 누르면 예약 폼 요청사항에 해당 플랜이 자동 입력됩니다
- **PT 예약 폼**
  - 연락처 입력 시 하이픈 자동 삽입, 휴대폰 번호 형식 검증
  - 오늘 이전 / 3개월 이후 날짜 선택 차단
  - 이름, 시간대, 운동 목적, 개인정보 동의 필수 검증 및 첫 오류 필드로 자동 이동
  - 통과 시 버튼 로딩 상태 후 예약 요약이 담긴 완료 모달 표시
- **접근성** — 시맨틱 마크업, 본문 바로가기 링크, `aria-invalid` / `role="alert"` 오류 안내, 모달 포커스 트랩과 ESC 닫기, `prefers-reduced-motion` 대응
- **반응형** — 360px 모바일부터 1180px 데스크톱까지 대응

> 예약 폼은 프론트엔드 목업입니다. 입력값은 서버로 전송되거나 저장되지 않습니다.

## 커스터마이징 포인트

- **브랜드 컬러 / 간격 / 폰트**: `assets/css/style.css` 최상단 `:root` 변수
  (`--accent`가 포인트 컬러입니다)
- **상호, 주소, 전화번호**: `index.html`의 헤더 로고, `#location` 섹션, 푸터
- **가격 플랜**: `index.html`의 `#panel-membership`, `#panel-pt` 안의 `.price-card`
  버튼 `data-plan` 값이 예약 폼에 그대로 입력됩니다
- **트레이너 정보**: `index.html`의 `.trainer-card`
  버튼 `data-trainer` 값과 예약 폼 `#trainer` select의 option 값을 함께 맞춰주세요
- **이미지**: `assets/img/`에 함께 담겨 있습니다 (Unsplash 라이선스).
  실제 촬영 사진으로 교체할 때는 같은 파일명으로 덮어쓰면 됩니다.
  트레이너 사진은 세로 구도(권장 640x960), OG 이미지는 1200x630을 맞춰주세요.
  로드에 실패하면 그라디언트 + 이니셜 플레이스홀더로 대체됩니다

## 배포

Cloudflare에 GitHub 저장소(`SeungDae321/ironworks_mockup`)를 연결해 배포합니다.
`main` 브랜치에 push하면 자동으로 재배포됩니다.

```bash
git push origin main
```

빌드 과정이 없는 정적 사이트이므로 배포 설정은 다음과 같습니다.

| 항목 | 값 |
| --- | --- |
| Framework preset | None |
| Build command | (비움) |
| Build output directory | `/` |
| Production branch | `main` |

`_headers`로 응답 헤더를 제어합니다. `/assets/*`는 1년 immutable 캐시,
HTML은 매번 재검증하도록 두었고 기본 보안 헤더를 함께 내려보냅니다.
이미지나 CSS를 교체했는데 반영이 늦으면 Cloudflare 대시보드에서 캐시를 비우세요.

`404.html`은 현재 서빙되지 않습니다. Cloudflare Pages가 아니라 Workers 정적 자산 방식으로
배포돼 있어서, 없는 경로는 기본 404 응답을 반환합니다.
연결하려면 `wrangler.jsonc`에 `assets.not_found_handling` 을 `"404-page"` 로 지정해야 합니다.

### 검색 노출

가상의 상호와 존재하지 않는 주소·전화번호를 쓰기 때문에 검색 색인을 막아두었습니다.
실제로 검색에 노출하려면 두 곳을 함께 수정하세요.

1. `index.html`의 `<meta name="robots" content="noindex, follow" />` 제거
2. `robots.txt`의 `Disallow: /` 제거

## 참고

가상의 브랜드와 인물, 가격으로 구성된 데모입니다. 실제 사업장과 관련이 없습니다.
사진은 Unsplash 라이선스 이미지이며, 등장 인물은 페이지 속 트레이너와 무관합니다.
