// 출처: 원내_스테로이드_검토표.xlsx / 피부제. 원본 품목 순서 유지.
// 미국 7단계 국소 역가 분류: I가 가장 강하고 VII가 가장 약함.
// 더마톱의 IV–V는 자료별 차이이며, 원본 등급 설명은 potencyLabel에 보존.
export const TOPICAL_STEROID_PRODUCTS = [
  {
    "drugCode": "DETHAOT",
    "productName": "데타손 연고 0.25% 30g/tub(동성)",
    "ingredient": "Desoximetasone",
    "strengthForm": "0.25% 연고; 30 g",
    "route": "피부 도포",
    "potencyClass": "II",
    "potencyLabel": "강함",
    "isPotencyUncertain": false,
    "isCombination": false,
    "reviewNote": "원본 성분 표기 desoxymethasone. 표준 성분명과 함께 원문 보존.",
    "evidenceUrl": "https://www.aafp.org/pubs/afp/issues/2021/0315/p337.html"
  },
  {
    "drugCode": "DSWN",
    "productName": "토피덤로션0.05%120g(코오롱)",
    "ingredient": "Desonide",
    "strengthForm": "0.05% 로션; 120 g",
    "route": "피부 도포",
    "potencyClass": "VI",
    "potencyLabel": "약함",
    "isPotencyUncertain": false,
    "isCombination": false,
    "reviewNote": "AAFP 2009 제형별 표의 로션 VI. AAFP 2021은 VI–VII 저강도군으로 묶음.",
    "evidenceUrl": "https://www.aafp.org/pubs/afp/issues/2009/0115/p135.html"
  },
  {
    "drugCode": "ESGEL1",
    "productName": "데속시원겔0.05% 30g/tub(더유)",
    "ingredient": "Desoximetasone",
    "strengthForm": "0.05% 겔; 30 g",
    "route": "피부 도포",
    "potencyClass": "II",
    "potencyLabel": "강함",
    "isPotencyUncertain": false,
    "isCombination": false,
    "reviewNote": "0.05% 크림과 겔의 등급을 혼동하지 않음.",
    "evidenceUrl": "https://www.aafp.org/pubs/afp/issues/2021/0315/p337.html"
  },
  {
    "drugCode": "LACHC",
    "productName": "하티손로션1%(한미)60ml/Bt",
    "ingredient": "Hydrocortisone",
    "strengthForm": "1% 로션; 60 mL",
    "route": "피부 도포",
    "potencyClass": "VII",
    "potencyLabel": "가장 약함",
    "isPotencyUncertain": false,
    "isCombination": false,
    "reviewNote": "원본 함량 단위는 10 mg/g, 포장은 60 mL. 밀도 없이 병당 mg 계산하지 않음.",
    "evidenceUrl": "https://www.aafp.org/pubs/afp/issues/2009/0115/p135.html"
  },
  {
    "drugCode": "ODERM5-O",
    "productName": "베타베이트연고0.05%15g/Tu(고려)",
    "ingredient": "Clobetasol propionate",
    "strengthForm": "0.05% 연고; 15 g",
    "route": "피부 도포",
    "potencyClass": "I",
    "potencyLabel": "가장 강함",
    "isPotencyUncertain": false,
    "isCombination": false,
    "reviewNote": "농도·제형이 일치하는 AAFP 분류.",
    "evidenceUrl": "https://www.aafp.org/pubs/afp/issues/2021/0315/p337.html"
  },
  {
    "drugCode": "OHAT25-L",
    "productName": "하티손로션2.5%(한미)60ml/Bt",
    "ingredient": "Hydrocortisone",
    "strengthForm": "2.5% 로션; 60 mL",
    "route": "피부 도포",
    "potencyClass": "VII",
    "potencyLabel": "가장 약함",
    "isPotencyUncertain": false,
    "isCombination": false,
    "reviewNote": "원본 함량 25 mg/mL.",
    "evidenceUrl": "https://www.aafp.org/pubs/afp/issues/2009/0115/p135.html"
  },
  {
    "drugCode": "OTITIB-O",
    "productName": "더마톱연고0.25%10g/Tu(한독)",
    "ingredient": "Prednicarbate",
    "strengthForm": "0.25% 연고; 10 g",
    "route": "피부 도포",
    "potencyClass": "IV–V",
    "potencyLabel": "5등급으로 분류한 참고자료 다수 — 일부 자료는 4등급",
    "isPotencyUncertain": true,
    "isCombination": false,
    "reviewNote": "등급은 제공된 비교자료의 분류를 요약. 식약처·FDA가 확정한 숫자 등급을 뜻하지 않음. 식약처는 성분·함량 확인 근거. 미국 0.1% 제품 등급을 국내 0.25% 연고에 전용하지 않음.",
    "evidenceUrl": "https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=198900818"
  },
  {
    "drugCode": "TRVOT",
    "productName": "트라보코트크림15g/Tu(레오파마)",
    "ingredient": "Diflucortolone valerate + isoconazole nitrate",
    "strengthForm": "원본: 1 mg + 10 mg (기준량 미기재); 크림 15 g",
    "route": "피부 도포",
    "potencyClass": "미확정",
    "potencyLabel": "미확정",
    "isPotencyUncertain": false,
    "isCombination": true,
    "reviewNote": "스테로이드·항진균제 복합제입니다. 디플루코르톨론발레레이트 0.1%와 이소코나졸질산염 1%를 함유합니다. 본 제품에 적용할 미국 7단계 역가 등급은 현재 확보한 근거로 확정하지 않았습니다.",
    "evidenceUrl": "https://pi-pil-repository.sahpra.org.za/wp-content/uploads/2023/06/Current-and-approved-PIL-Travocort-230509.pdf"
  }
];
