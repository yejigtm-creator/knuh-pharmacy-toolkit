// 원본: 약제과 뉴스레터 2026-1호 (1~2페이지, "인슐린" 섹션)
export const INSULIN_META = {
  "title": "인슐린",
  "asOf": "약제과 뉴스레터 2026년 1호 기준",
};

// 인슐린 종류별 분류 및 작용 특성 (뉴스레터 1페이지 표)
export const INSULIN_CLASSIFICATION = [
  { "category": "초속효성", "ingredient": "lispro, aspart, glulisine", "onset": "10~15분", "peak": "1~2시간", "duration": "3~5시간" },
  { "category": "속효성", "ingredient": "regular insulin", "onset": "30~60분", "peak": "2~4시간", "duration": "6~8시간" },
  { "category": "중간형", "ingredient": "NPH insulin", "onset": "1~2시간", "peak": "6~10시간", "duration": "12~18시간" },
  { "category": "지속형", "ingredient": "glargine, degludec, detemir", "onset": "1~2시간", "peak": "—", "duration": "24시간 이상" },
];

// 원내 인슐린 목록 (뉴스레터 2페이지 표, 분류: 작용속도)
export const INSULIN_PRODUCTS = [
  { "id": "ins-1", "category": "초속효성", "drugCode": "IAH", "productName": "노보래피드주 1000IU", "ingredient": "insulin aspart", "dosageForm": "바이알", "availability": "원내/외" },
  { "id": "ins-2", "category": "초속효성", "drugCode": "IAHS1", "productName": "노보래피드플렉스펜주 300IU", "ingredient": "insulin aspart", "dosageForm": "펜", "availability": "원내/외" },
  { "id": "ins-3", "category": "초속효성", "drugCode": "INOVO-RP", "productName": "룸제브퀵펜주 300IU", "ingredient": "insulin lispro (바이오시밀러)", "dosageForm": "펜", "availability": "원외" },
  { "id": "ins-4", "category": "초속효성", "drugCode": "IHUMA", "productName": "피아스프플렉스터치주 300IU", "ingredient": "insulin aspart", "dosageForm": "펜", "availability": "원외" },
  { "id": "ins-5", "category": "초속효성", "drugCode": "IHUMAPEN", "productName": "휴마로그HD퀵펜주 300IU (U-200)", "ingredient": "insulin lispro HD", "dosageForm": "펜", "availability": "원외" },
  { "id": "ins-6", "category": "초속효성", "drugCode": "IHUMAHD", "productName": "휴마로그주 1000IU", "ingredient": "insulin lispro", "dosageForm": "바이알", "availability": "원내/외" },
  { "id": "ins-7", "category": "초속효성", "drugCode": "ILHS3", "productName": "휴마로그퀵펜주 300IU", "ingredient": "insulin lispro", "dosageForm": "펜", "availability": "원내/외" },
  { "id": "ins-8", "category": "속효성", "drugCode": "IHUMUL-R", "productName": "휴물린R주 1000IU", "ingredient": "insulin human (RI)", "dosageForm": "바이알", "availability": "원내/외" },
  { "id": "ins-9", "category": "중간형", "drugCode": "IHUMU-N", "productName": "휴물린N주 1000IU", "ingredient": "insulin human (NPH)", "dosageForm": "바이알", "availability": "원내/외" },
  { "id": "ins-10", "category": "중간형", "drugCode": "IHUMNPEN", "productName": "휴물린엔퀵펜 300IU", "ingredient": "insulin human (NPH)", "dosageForm": "펜", "availability": "원내/외" },
  { "id": "ins-11", "category": "지속형", "drugCode": "ILANTUS", "productName": "란투스주 1000IU", "ingredient": "insulin glargine", "dosageForm": "바이알", "availability": "원내/외" },
  { "id": "ins-12", "category": "지속형", "drugCode": "ILANTUV", "productName": "란투스주솔로스타 300IU", "ingredient": "insulin glargine", "dosageForm": "펜", "availability": "원내/외" },
  { "id": "ins-13", "category": "지속형", "drugCode": "ITOUJES", "productName": "레버미어플렉스펜 300IU", "ingredient": "insulin detemir", "dosageForm": "펜", "availability": "원내/외" },
  { "id": "ins-14", "category": "지속형", "drugCode": "ILEVEMI", "productName": "투제오주솔로스타 450IU (U-300)", "ingredient": "insulin glargine", "dosageForm": "펜", "availability": "원내/외" },
  { "id": "ins-15", "category": "지속형", "drugCode": "ITRESI-P", "productName": "트레시바플렉스터치주 300U", "ingredient": "insulin degludec", "dosageForm": "펜", "availability": "원내/외" },
  { "id": "ins-16", "category": "혼합형", "drugCode": "IHUMA25P", "productName": "노보믹스30플렉스펜주 300IU (aspart:protamin=30:70)", "ingredient": "insulin aspart + protamin", "dosageForm": "펜", "availability": "원내/외" },
  { "id": "ins-17", "category": "혼합형", "drugCode": "IHUMA50P", "productName": "노보믹스50플렉스펜주 300IU (aspart:protamin=50:50)", "ingredient": "insulin aspart + protamin", "dosageForm": "펜", "availability": "원외" },
  { "id": "ins-18", "category": "혼합형", "drugCode": "INOVO30", "productName": "휴마로그믹스25퀵펜주 300IU (lispro:NPL=25:75)", "ingredient": "insulin lispro + NPL", "dosageForm": "펜", "availability": "원내/외" },
  { "id": "ins-19", "category": "혼합형", "drugCode": "INRHS8", "productName": "휴마로그믹스50퀵펜주 300IU (lispro:NPL=50:50)", "ingredient": "insulin lispro + NPL", "dosageForm": "펜", "availability": "원내/외" },
  { "id": "ins-20", "category": "혼합형", "drugCode": "INRHV", "productName": "휴물린주 70/30 1000IU (NPH:RI=70:30)", "ingredient": "insulin human NPH + RI", "dosageForm": "바이알", "availability": "원내/외" },
  { "id": "ins-21", "category": "기저 + GLP-1 복합", "drugCode": "IRYZODEG", "productName": "리조덱플렉스터치주 300IU", "ingredient": "degludec + aspart", "dosageForm": "펜", "availability": "원내/외" },
  { "id": "ins-22", "category": "기저 + GLP-1 복합", "drugCode": "LGDG", "productName": "솔리쿠아펜주 (10-40) 300IU", "ingredient": "glargine + lixisenatide", "dosageForm": "펜", "availability": "원외" },
  { "id": "ins-23", "category": "기저 + GLP-1 복합", "drugCode": "ISOLIQ15", "productName": "솔리쿠아펜주 (30-60) 300IU", "ingredient": "glargine + lixisenatide", "dosageForm": "펜", "availability": "원외" },
  { "id": "ins-24", "category": "기저 + GLP-1 복합", "drugCode": "SOLIQ3", "productName": "줄토피플렉스터치주 300IU", "ingredient": "degludec + liraglutide", "dosageForm": "펜", "availability": "원내/외" },
];

// 목록 표 아래 코멘트로 표시할 주의사항 (뉴스레터 2페이지 하단)
export const INSULIN_NOTES = [
  "휴마로그HD(U-200): 일반 lispro 대비 2배 농도 — 동일 볼륨 투여 시 2배 용량이 들어가므로 단위 확인 필수.",
  "투제오(U-300): 란투스 대비 3배 농도 — 용량 비교 및 전환 시 주의.",
  "리조덱·줄토피: 기저인슐린 + 추가 성분 복합 제제 — 처방 시작 및 변경 시 별도 교육 필요.",
  "Glargine(란투스 등) 지속형 인슐린은 다른 인슐린과 혼합 금지 — pH 변화로 침전 발생.",
  "인슐린 펜은 환자 개인 전용 사용 원칙 — 바늘 교체 여부와 무관하게 공유 절대 금지. (혈액 역류 위험)",
  "개봉 후 보관 조건 확인 필수 — 제품별로 개봉 후 사용 기간 상이 (원내규정 28일 이내).",
];
