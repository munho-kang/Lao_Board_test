// ============================================================
//  ⚙️  백엔드(Render) 주소 설정 — 여기 한 줄만 고치면 됩니다
// ============================================================
//
//  1. Render에 백엔드를 먼저 배포하세요.
//  2. 배포가 끝나면 Render 대시보드 상단에 뜨는 주소를 복사하세요.
//     (예: https://lao-board-test.onrender.com)
//  3. 아래 따옴표 안의 값을 그 주소로 바꾸고 커밋 & 푸시하세요.
//
//  ⚠️ 주소 끝에 슬래시(/)나 /api 는 붙이지 마세요.
//
const RENDER_API_URL = 'https://lao-board-test.onrender.com';
//
// ============================================================
//  아래는 수정할 필요 없습니다.
// ============================================================

// 로컬에서 `npm start`로 실행할 때는 같은 서버의 API를 사용합니다.
const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname);

// 주소 끝에 슬래시를 붙여 넣었더라도 문제없이 동작하도록 정리합니다.
window.API_BASE_URL = isLocalhost ? '' : RENDER_API_URL.replace(/\/+$/, '');

// Render 주소를 아직 입력하지 않았는지 확인합니다.
// (입력 전에는 화면에 "무엇을 해야 하는지" 안내가 표시됩니다)
window.API_CONFIGURED = isLocalhost || !RENDER_API_URL.includes('여기에');
