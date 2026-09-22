import React from "react";
import { PREOPERATIVE_META as meta, PREOPERATIVE_MEDICATIONS as medications } from "@/app/data/preoperativeMedications";
import { Card, CardContent } from "@/components/ui/card";
import PebbleButton from "@/components/ui/PebbleButton";

export default function PreoperativeMedicationInfo() {
  const count = medications.reduce((total, group) => total + group.products.length, 0);
  return (
    <Card className="min-w-0 rounded-3xl border border-[#e5dccf] bg-[#f8f4ed] shadow-[0_10px_30px_rgba(99,88,70,0.08)]">
      <header className="flex flex-wrap items-start justify-between gap-4 p-6">
        <div>
          <h2 className="text-2xl text-[#3e372f]">{meta.title}</h2>
          <p className="mt-2 text-sm text-[#6f665a]">원내 코드 보유 약품 · {count}품목</p>
        </div>
        <PebbleButton href={meta.downloadUrl} download={meta.downloadName} variant="sage" className="shrink-0">PDF 다운로드</PebbleButton>
      </header>
      <CardContent>
        <p className="mb-4 rounded-2xl border-l-4 border-[#7A816C] bg-[#ede6da] p-4 text-sm leading-relaxed text-[#3e372f]">{meta.notice}</p>
        <div className="max-w-full overflow-x-auto rounded-2xl border border-[#e5dccf] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7A816C]" role="region" aria-label="수술 전 약물 확인 목록" tabIndex={0}>
          <table className="w-full min-w-[560px] border-collapse text-left text-sm leading-relaxed text-[#5f574d]">
            <caption className="sr-only">성분별 원내 약품명과 함량</caption>
            <thead className="bg-[#ede6da] text-[#3e372f]"><tr><th scope="col" className="w-1/3 px-4 py-3">성분명</th><th scope="col" className="px-4 py-3">원내 약품명·함량</th></tr></thead>
            <tbody className="divide-y divide-[#e5dccf] bg-white">
              {medications.map(group => <tr key={group.id} className="align-top">
                <th scope="row" className="px-4 py-3 font-medium text-[#3e372f]">{group.ingredient || "원본 성분명 미기재"}</th>
                <td className="px-4 py-3"><ul className="space-y-1">{group.products.map(product => <li key={product}>{product}</li>)}</ul></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[#6f665a]">{meta.footer.replace(" 예:", "\n예:")}</p>
      </CardContent>
    </Card>
  );
}
