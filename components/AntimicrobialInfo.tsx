"use client";

import React, { useMemo, useState } from "react";
import { ANTIMICROBIAL_META as meta, ANTIMICROBIAL_PRODUCTS as products } from "@/app/data/antimicrobialProducts";
import { Card, CardContent } from "@/components/ui/card";
import PebbleButton from "@/components/ui/PebbleButton";

const categories = Array.from(new Set(products.map(p => p.category)));
const normalize = (value: string) => value.toLocaleLowerCase().replace(/\s+/g, "");
// 계열명 앞에 붙은 번호 표기("10.Polymyxin", "[4]항바이러스제" 등)를 화면 표시용으로만 제거합니다.
// 원본 데이터(ANTIMICROBIAL_PRODUCTS)의 category 값 자체는 바꾸지 않으므로 필터링은 그대로 동작합니다.
const stripCategoryPrefix = (value: string): string => value.replace(/^(\[\d+\]|\d+\.)\s*/, "");
// 헤더별로 다른 줄바꿈/너비 규칙이 필요해 배열로 분리했습니다.
// "투여경로 / 제형"만 두 줄로 줄바꿈을 허용해 폭을 줄이고, 그 여유 공간을 "세대" 열이 가져가도록 최소 너비를 지정했습니다.
const TABLE_HEADERS: { key: string; label: React.ReactNode; className: string }[] = [
  { key: "계열", label: "계열", className: "whitespace-nowrap" },
  { key: "상품명 / 약품코드", label: "상품명 / 약품코드", className: "whitespace-nowrap" },
  { key: "성분/함량", label: "성분/함량", className: "whitespace-nowrap" },
  { key: "투여경로 / 제형", label: <>투여경로 /<br />제형</>, className: "whitespace-normal" },
  { key: "세대", label: "세대", className: "whitespace-nowrap min-w-[64px]" },
  { key: "복지약효분류", label: "복지약효분류", className: "whitespace-nowrap" },
  { key: "원내보유", label: "원내보유", className: "whitespace-nowrap" },
];

export default function AntimicrobialInfo() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState("all");
  const filtered = useMemo(() => products.filter(p =>
    (!category || p.category === category) &&
    (availability === "all" || (availability === "Y" ? p.availability === "Y" : p.availability !== "Y")) &&
    (!normalize(query) || [p.productName, p.ingredientStrength, p.drugCode, p.category].some(value => normalize(value).includes(normalize(query))))
  ), [query, category, availability]);
  const inputStyle = "mt-1 w-full rounded-xl border border-[#e5dccf] bg-white px-3 py-2 text-sm text-[#3e372f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7A816C]";
  return (
    <Card className="min-w-0 rounded-3xl border border-[#e5dccf] bg-[#f8f4ed] shadow-[0_10px_30px_rgba(99,88,70,0.08)]">
      <header className="flex flex-wrap items-start justify-between gap-4 p-6">
        <div>
          <h2 className="text-2xl text-[#3e372f]">{meta.title}</h2>
          <p className="mt-2 text-sm text-[#6f665a]">항균제·항결핵제·항진균제·항바이러스제·항원충제·구충제 등</p>
          <p className="mt-1 text-sm text-[#6f665a]">{meta.asOf} · 전체 {products.length}개 목록 항목</p>
        </div>
        <PebbleButton href={meta.downloadUrl} download={meta.downloadName} variant="sage" className="shrink-0">엑셀 다운로드</PebbleButton>
      </header>
      <CardContent>
        <div className="mb-4 grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
          <label className="text-sm text-[#5f574d]">약품 검색<input value={query} onChange={e => setQuery(e.target.value)} placeholder="상품명, 성분, 약품코드, 계열" className={inputStyle} /></label>
          <label className="text-sm text-[#5f574d]">계열<select value={category} onChange={e => setCategory(e.target.value)} className={inputStyle}><option value="">전체 계열</option>{categories.map(c => <option key={c} value={c}>{stripCategoryPrefix(c)}</option>)}</select></label>
          <label className="text-sm text-[#5f574d]">원내보유<select value={availability} onChange={e => setAvailability(e.target.value)} className={inputStyle}><option value="all">전체</option><option value="Y">Y</option><option value="N">N</option></select></label>
        </div>
        <p className="mb-2 text-sm text-[#6f665a]" role="status">{filtered.length}개 항목 표시</p>
        <div className="max-h-[65vh] max-w-full overflow-auto rounded-2xl border border-[#e5dccf] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7A816C]" tabIndex={0} role="region" aria-label="항감염제 목록">
          <table className="w-full min-w-[1050px] border-collapse text-left text-sm leading-relaxed text-[#5f574d]">
            <caption className="sr-only">{meta.title} · {meta.asOf}</caption>
            <thead className="sticky top-0 bg-[#ede6da] text-[#3e372f]"><tr>{TABLE_HEADERS.map(h => <th key={h.key} scope="col" className={`px-3 py-3 text-center text-xs font-semibold ${h.className}`}>{h.label}</th>)}</tr></thead>
            <tbody className="divide-y divide-[#e5dccf] bg-white">
              {filtered.map(p => <tr key={p.id} className="align-top">
                <td className="px-3 py-3">{stripCategoryPrefix(p.category)}</td>
                <th scope="row" className="min-w-[220px] px-3 py-3 font-medium text-[#3e372f]">{p.productName}<span className="mt-1 block text-xs font-normal text-[#6f665a]">{p.drugCode}</span></th>
                <td className="min-w-[240px] whitespace-pre-wrap px-3 py-3">{p.ingredientStrength}</td>
                <td className="px-3 py-3">{p.route}<span className="block text-xs">{p.dosageForm}</span></td>
                <td className="whitespace-nowrap px-3 py-3">{p.generation || "—"}</td><td className="px-3 py-3">{p.classificationCode || "—"}</td>
                <td className="whitespace-nowrap px-3 py-3">{p.availability === "Y" ? "Y" : "N"}</td>
              </tr>)}
              {!filtered.length && <tr><td colSpan={7} className="px-4 py-10 text-center">검색 조건에 맞는 약품이 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
