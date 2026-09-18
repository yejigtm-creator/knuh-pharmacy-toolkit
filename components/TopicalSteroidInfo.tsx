import React from "react";
import { TOPICAL_STEROID_PRODUCTS } from "@/app/data/topicalSteroidProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 화면 정렬 순서이며 임상적 역가 수치를 뜻하지 않습니다.
const POTENCY_DISPLAY_ORDER = ["I", "II", "III", "IV", "IV–V", "V", "VI", "VII", "미확정"];
const POTENCY_BADGE_COLORS: Record<string, string> = {
  I: "bg-[#46543f] text-white border-[#46543f]",
  II: "bg-[#46543f] text-white border-[#46543f]",
  III: "bg-[#b9c5ad] text-[#283522] border-[#9eae90]",
  IV: "bg-[#b9c5ad] text-[#283522] border-[#9eae90]",
  "IV–V": "bg-[#b9c5ad] text-[#283522] border-[#9eae90]",
  V: "bg-[#b9c5ad] text-[#283522] border-[#9eae90]",
  VI: "bg-[#edf2e8] text-[#46543f] border-[#d4dfca]",
  VII: "bg-[#edf2e8] text-[#46543f] border-[#d4dfca]",
  미확정: "bg-[#f1f1f1] text-[#525252] border-[#d4d4d4]",
};

// 원본을 복사해 정렬하며 같은 등급은 원본 순서를 유지합니다.
const sortedProducts = [...TOPICAL_STEROID_PRODUCTS].sort((a, b) => {
  const aOrder = POTENCY_DISPLAY_ORDER.indexOf(a.potencyClass);
  const bOrder = POTENCY_DISPLAY_ORDER.indexOf(b.potencyClass);
  return (aOrder < 0 ? POTENCY_DISPLAY_ORDER.length : aOrder)
    - (bOrder < 0 ? POTENCY_DISPLAY_ORDER.length : bOrder);
});

const POTENCY_EVIDENCE: Record<string, { reason: string; linkLabel: string }> = {
  "ODERM5-O": { reason: "AAFP 2021 역가표에서 Clobetasol propionate 0.05% 연고를 I등급으로 분류합니다.", linkLabel: "역가 분류표 보기" },
  DETHAOT: { reason: "AAFP 2021 역가표에서 Desoximetasone 0.25% 연고를 II등급으로 분류합니다.", linkLabel: "역가 분류표 보기" },
  ESGEL1: { reason: "AAFP 2021 역가표에서 Desoximetasone 0.05% 겔을 II등급으로 분류합니다.", linkLabel: "역가 분류표 보기" },
  DSWN: { reason: "AAFP 2009 역가표에서 Desonide 0.05% 로션을 VI등급으로 분류합니다. AAFP 2021에서는 VI–VII 저역가군으로 묶어 표시합니다.", linkLabel: "역가 분류표 보기" },
  LACHC: { reason: "AAFP 2009 역가표에서 Hydrocortisone 1% 로션을 VII등급으로 분류합니다.", linkLabel: "역가 분류표 보기" },
  "OHAT25-L": { reason: "AAFP 2009 역가표에서 Hydrocortisone 2.5% 로션을 VII등급으로 분류합니다.", linkLabel: "역가 분류표 보기" },
  "OTITIB-O": { reason: "원본 검토표에는 IV–V로 정리되어 있으나, 국내 0.25% 연고에 적용할 등급 근거는 추가 확인이 필요합니다. 아래 제품정보는 성분·함량 확인 자료이며, IV–V 등급의 근거는 아닙니다.", linkLabel: "제품정보 보기" },
  TRVOT: { reason: "현재 확보한 자료로는 본 제품의 미국 7단계 역가 등급을 확정하지 않았습니다. 아래 제품정보는 성분·함량 확인 자료이며, 숫자 등급의 근거는 아닙니다.", linkLabel: "제품정보 보기" },
};

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function TopicalSteroidInfo() {
  return (
    <Card className="min-w-0 w-full max-w-full rounded-3xl border border-[#e5dccf] bg-[#f8f4ed] shadow-[0_10px_30px_rgba(99,88,70,0.08)]">
      <CardHeader>
        <CardTitle className="text-2xl text-[#3e372f]">스테로이드 외용제</CardTitle>
        <p className="text-sm text-[#8a8175]">
          원내 스테로이드 외용제 {TOPICAL_STEROID_PRODUCTS.length}품목
        </p>
      </CardHeader>
      <CardContent>
        <div
          className="max-w-full overflow-x-auto rounded-2xl border border-[#e5dccf] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7A816C]"
          role="region"
          aria-label="원내 스테로이드 외용제 비교표"
          tabIndex={0}
        >
          <table className="w-full min-w-[760px] border-collapse text-left text-sm leading-relaxed text-[#5f574d]">
            <caption className="sr-only">원내 스테로이드 외용제 역가·상품명·성분·함량 및 제형</caption>
            <thead className="bg-[#ede6da] text-[#3e372f]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">역가</th>
                <th scope="col" className="px-4 py-3 font-semibold">상품명</th>
                <th scope="col" className="px-4 py-3 font-semibold">성분</th>
                <th scope="col" className="px-4 py-3 font-semibold">함량·제형</th>
                <th scope="col" className="px-4 py-3 font-semibold">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5dccf] bg-white">
              {sortedProducts.map((product) => (
                <tr key={product.drugCode} className="align-top">
                  <td className="px-4 py-3">
                    <span className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${POTENCY_BADGE_COLORS[product.potencyClass] ?? POTENCY_BADGE_COLORS["미확정"]}`}>
                      {product.isPotencyUncertain
                        ? "IV–V · 자료별 차이"
                        : product.isCombination && product.potencyClass === "미확정"
                          ? "미확정 · 복합제"
                          : `${product.potencyClass} · ${product.potencyLabel}`}
                    </span>
                    {product.isPotencyUncertain && (
                      <p className="mt-1 min-w-[180px] text-xs text-[#6f665a]">
                        {product.potencyLabel}
                      </p>
                    )}
                  </td>
                  <th scope="row" className="px-4 py-3 font-medium text-[#3e372f]">{product.productName}</th>
                  <td className="px-4 py-3">{product.ingredient}</td>
                  <td className="px-4 py-3">{product.strengthForm}</td>
                  <td className="px-4 py-3">
                    <details className="w-64 max-w-full">
                      <summary
                        aria-label={`${product.productName} 상세 보기`}
                        className="cursor-pointer rounded px-1 py-1 font-medium text-[#46543f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A816C]"
                      >
                        상세 보기
                      </summary>
                      <div className="mt-3 space-y-3 break-words rounded-xl border border-[#e5dccf] bg-[#f8f4ed] p-3">
                        <div>
                          <p className="font-semibold text-[#3e372f]">등급 분류 근거</p>
                          <p className="mt-1">
                            {POTENCY_EVIDENCE[product.drugCode]?.reason ?? "해당 품목의 등급 분류 근거는 추가 확인이 필요합니다."}
                          </p>
                          <div className="mt-2">
                            {!product.evidenceUrl?.trim() ? (
                              "등록된 근거자료가 없습니다."
                            ) : isHttpUrl(product.evidenceUrl) ? (
                              <a
                                href={product.evidenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded text-[#46543f] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A816C]"
                              >
                                {POTENCY_EVIDENCE[product.drugCode]?.linkLabel ?? "근거자료 보기"} (새 탭)
                              </a>
                            ) : (
                              "근거자료 URL을 확인해 주세요."
                            )}
                          </div>
                        </div>
                        <details className="border-t border-[#e5dccf] pt-3">
                          <summary
                            aria-label={`${product.productName} 약사 검토사항`}
                            className="cursor-pointer rounded font-medium text-[#46543f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A816C]"
                          >
                            약사 검토사항
                          </summary>
                          <p className="mt-2 whitespace-pre-wrap">
                            {product.reviewNote?.trim() ? product.reviewNote : "등록된 검토사항이 없습니다."}
                          </p>
                        </details>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-2 text-sm leading-relaxed text-[#6f665a]">
          <p>미국 7단계 국소 역가 분류로, I가 가장 강하고 VII가 가장 약합니다. 같은 성분이라도 농도·제형·기제에 따라 역가가 달라질 수 있습니다.</p>
          <p>더마톱의 등급은 참고자료별 차이가 있으며, 트라보코트는 복합제로 숫자 등급이 미확정입니다.</p>
        </div>
      </CardContent>
    </Card>
  );
}
