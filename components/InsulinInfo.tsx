"use client";

import React from "react";
import { INSULIN_META as meta, INSULIN_CLASSIFICATION as classification, INSULIN_PRODUCTS as products, INSULIN_NOTES as notes } from "@/app/data/insulinProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 위 그래프(이미지)의 범례 색상에서 추출한 값입니다. 그래프 원색 그대로는 흰 배경에서 대비가
// 약해 읽기 불편한 것(속효성, 중간형)이 있어 같은 색조를 유지하면서 명도만 낮췄습니다.
// "지속형"은 그래프에서 디터머(보라)·글라진(핑크) 두 곡선으로 나뉘어 있는데, 분류표·목록표는 한
// 분류로 합쳐져 있어 대표색으로 글라진 색을 사용했습니다. 디터머 색으로 바꾸거나 나누고 싶으시면 말씀해주세요.
// "혼합형", "기저 + GLP-1 복합"은 그래프에 없는 분류라 나머지 4개(청록/초록/주황/핑크)와
// 구분되도록 파란색·보라색 계열을 새로 골랐습니다.
const CATEGORY_COLORS: Record<string, string> = {
  "초속효성": "#12809b",
  "속효성": "#5e8116",
  "중간형": "#ac6609",
  "지속형": "#d61861",
  "혼합형": "#2b72d6",
  "기저 + GLP-1 복합": "#945ac7",
};

export default function InsulinInfo() {
  return (
    <div className="min-w-0 space-y-6">
      <Card className="min-w-0 rounded-3xl border border-[#e5dccf] bg-[#f8f4ed] shadow-[0_10px_30px_rgba(99,88,70,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl text-[#3e372f]">인슐린 종류별 분류 및 작용 특성</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-full overflow-x-auto rounded-2xl border border-[#e5dccf]" role="region" aria-label="인슐린 종류별 분류 및 작용 특성" tabIndex={0}>
            <table className="w-full min-w-[560px] border-collapse text-left text-sm leading-relaxed text-[#5f574d]">
              <caption className="sr-only">인슐린 종류별 분류, 대표성분, 작용시작, 최고효과, 지속시간</caption>
              <thead className="bg-[#ede6da] text-[#3e372f]">
                <tr>{["분류", "대표성분", "작용시작", "최고효과", "지속시간"].map(h => <th key={h} scope="col" className="whitespace-nowrap px-3 py-3 text-center text-xs font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#e5dccf] bg-white">
                {classification.map(row => (
                  <tr key={row.category} className="align-top">
                    <th scope="row" className="whitespace-nowrap px-3 py-3 font-semibold" style={{ color: CATEGORY_COLORS[row.category] }}>{row.category}</th>
                    <td className="px-3 py-3">{row.ingredient}</td>
                    <td className="whitespace-nowrap px-3 py-3">{row.onset}</td>
                    <td className="whitespace-nowrap px-3 py-3">{row.peak}</td>
                    <td className="whitespace-nowrap px-3 py-3">{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center rounded-2xl bg-white p-4">
            <img
              src="/drug-info/insulin-timing-graph.png"
              alt="인슐린 종류별 혈중농도-시간 그래프: 초속효성(Rapid Acting), 속효성(Regular), 중간형(NPH), 지속형(디터머), 지속형(글라진) 인슐린의 작용 시작·최고효과·지속시간 비교 곡선"
              className="h-auto max-w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0 rounded-3xl border border-[#e5dccf] bg-[#f8f4ed] shadow-[0_10px_30px_rgba(99,88,70,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl text-[#3e372f]">원내 인슐린 목록</CardTitle>
          <p className="text-sm text-[#8a8175]">작용속도 분류 기준 · 전체 {products.length}개 품목</p>
        </CardHeader>
        <CardContent>
          <div className="max-h-[65vh] max-w-full overflow-auto rounded-2xl border border-[#e5dccf]" role="region" aria-label="원내 인슐린 목록" tabIndex={0}>
            <table className="w-full min-w-[900px] border-collapse text-left text-sm leading-relaxed text-[#5f574d]">
              <caption className="sr-only">{meta.title} · {meta.asOf}</caption>
              <thead className="sticky top-0 bg-[#ede6da] text-[#3e372f]">
                <tr>{["분류", "약품코드", "약품명", "성분", "제형", "원내보유"].map(h => <th key={h} scope="col" className="whitespace-nowrap px-3 py-3 text-center text-xs font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#e5dccf] bg-white">
                {products.map(p => (
                  <tr key={p.id} className="align-top">
                    <td className="whitespace-nowrap px-3 py-3 font-semibold" style={{ color: CATEGORY_COLORS[p.category] }}>{p.category}</td>
                    <td className="whitespace-nowrap px-3 py-3">{p.drugCode}</td>
                    <th scope="row" className="min-w-[220px] px-3 py-3 font-medium text-[#3e372f]">{p.productName}</th>
                    <td className="min-w-[200px] px-3 py-3">{p.ingredient}</td>
                    <td className="whitespace-nowrap px-3 py-3">{p.dosageForm}</td>
                    <td className="whitespace-nowrap px-3 py-3">{p.availability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-2 rounded-2xl border-l-4 border-[#46543f] bg-[#f3ede3] p-4 text-sm leading-relaxed text-[#5f574d]">
            <p className="font-semibold text-[#3e372f]">주의사항</p>
            <ul className="list-disc space-y-1 pl-5">
              {notes.map((note, index) => <li key={index}>{note}</li>)}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
