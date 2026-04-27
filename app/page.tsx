"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type TabKey = "split" | "syrup" | "label";
type SplitMode = "mg" | "t";
type LabelMode = "text" | "image";
type ImageCategory = "take" | "stop" | "pictogram" | "prep";

type Recommendation = {
  packs: number;
  tabs: number;
  score: number;
  accuracy: number;
  precisionLabel: string;
  reason: string;
  kind?: "practical" | "accuracy";
};

type CalcResult = {
  totalTabs: number;
  perPack: number;
  ratio: number;
};

type SavedLabel = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

type SyrupDrug = {
  name: string;
  gramsPerMl: number;
};

type LabelImagePreset = {
  key: string;
  category: ImageCategory;
  label: string;
  src: string;
};

const LABEL_STORAGE_KEY = "yj-pharmacy-labels-v1";
const FAVORITE_STORAGE_KEY = "yj-label-favorites";
const IMAGE_ASSET_VERSION = "20260421-2";

const HTML_LABEL_VENTOLIN = "html:ventolin-neb";
const HTML_LABEL_FEVER_DETAIL = "html:fever-detail";
const HTML_LABEL_AUGMENTIN_DUO = "html:augmentin-duo";
const HTML_LABEL_AMOCRANEO = "html:amocraneo";
const HTML_LABEL_TAKE_FEVER_6HR = "html:take-fever-6hr";
const HTML_LABEL_TAKE_SLEEP = "html:take-sleep";
const HTML_LABEL_TAKE_NAUSEA = "html:take-nausea";
const HTML_LABEL_TAKE_CHEST_PAIN = "html:take-chest-pain";
const HTML_LABEL_TAKE_HIVES = "html:take-hives";
const HTML_LABEL_TAKE_ITCHING = "html:take-itching";
const HTML_LABEL_TAKE_DIARRHEA = "html:take-diarrhea";
const HTML_LABEL_TAKE_FEVER = "html:take-fever";
const HTML_LABEL_TAKE_PAIN = "html:take-pain";
const HTML_LABEL_TAKE_PAIN_FEVER = "html:take-pain-fever";
const HTML_LABEL_TAKE_WATERY_DIARRHEA = "html:take-watery-diarrhea";
const HTML_LABEL_TAKE_HEADACHE = "html:take-headache";

const STOP_LABELS = {
  diarrhea: "html:stop-diarrhea",
  drowsy: "html:stop-drowsy",
  improve: "html:stop-improve",
  tremor: "html:stop-tremor",
  fussy: "html:stop-fussy",
  looseStool: "html:stop-loose-stool",
} as const;

const PICTOGRAM_LABELS = {
  cough: "html:pictogram-cough",
  coughPhlegm: "html:pictogram-cough-phlegm",
  phlegm: "html:pictogram-phlegm",
  runnyNose: "html:pictogram-runny-nose",
  runnyNoseItch: "html:pictogram-runny-nose-itch",
  stuffyNose: "html:pictogram-stuffy-nose",
  inhaler: "html:pictogram-inhaler",
  antidiarrheal: "html:pictogram-antidiarrheal",
  antibiotic: "html:pictogram-antibiotic",
  painReliever: "html:pictogram-pain-reliever",
  constipation: "html:pictogram-constipation",
} as const;

const SYRUP_DRUGS: SyrupDrug[] = [
  { name: "오구멘틴 듀오시럽", gramsPerMl: 0.11 },
  { name: "파목신 건조시럽", gramsPerMl: 0.77 },
  { name: "아모크라 네오시럽", gramsPerMl: 0.22 },
  { name: "듀리세프 건조시럽", gramsPerMl: 261.1 / 470 },
  { name: "바난 건조시럽", gramsPerMl: 0.2 },
  { name: "클래리 건조시럽", gramsPerMl: 0.7 },
  { name: "디푸루칸 건조시럽", gramsPerMl: 0.61 },
  { name: "포리부틴 건조시럽", gramsPerMl: 0.61 },
  { name: "아지탑스 건조시럽", gramsPerMl: 0.87 },
];

const SORTED_SYRUP_DRUGS = [...SYRUP_DRUGS].sort((a, b) => a.name.localeCompare(b.name, "ko"));

const SYRUP_INFO: Record<string, { storage: "냉장" | "실온"; duration: string }> = {
  "듀리세프 건조시럽": { storage: "냉장", duration: "14일" },
  "디푸루칸 건조시럽": { storage: "실온", duration: "14일" },
  "바난 건조시럽": { storage: "냉장", duration: "14일" },
  "아모크라 네오시럽": { storage: "냉장", duration: "7일" },
  "아지탑스 건조시럽": { storage: "실온", duration: "5일" },
  "오구멘틴 듀오시럽": { storage: "냉장", duration: "7일" },
  "클래리 건조시럽": { storage: "실온", duration: "14일" },
  "파목신 건조시럽": { storage: "냉장", duration: "14일" },
  "포리부틴 건조시럽": { storage: "실온", duration: "15일" },
};

const LABEL_IMAGE_PRESETS: LabelImagePreset[] = [
  { key: "prep-ventolin-neb", category: "prep", label: "벤토린 흡입액 조제방법", src: HTML_LABEL_VENTOLIN },
  { key: "pictogram-fever-detail", category: "pictogram", label: "해열제 안내", src: HTML_LABEL_FEVER_DETAIL },
  { key: "fever-6hr", category: "take", label: "38도이상 열날 때 6시간 간격으로 복용", src: HTML_LABEL_TAKE_FEVER_6HR },
  { key: "sleep", category: "take", label: "수면장애 시 복용하세요", src: HTML_LABEL_TAKE_SLEEP },
  { key: "nausea", category: "take", label: "속이 울렁거릴 때 복용하세요", src: HTML_LABEL_TAKE_NAUSEA },
  { key: "chest-pain", category: "take", label: "가슴 통증 시 혀밑에 1알 넣으세요", src: HTML_LABEL_TAKE_CHEST_PAIN },
  { key: "hives", category: "take", label: "두드러기 발생 시 복용하세요", src: HTML_LABEL_TAKE_HIVES },
  { key: "itching", category: "take", label: "가려움 발생 시 복용하세요", src: HTML_LABEL_TAKE_ITCHING },
  { key: "diarrhea-medicine", category: "take", label: "(지사제) 설사 시 복용하세요", src: HTML_LABEL_TAKE_DIARRHEA },
  { key: "fever", category: "take", label: "발열 시 복용하세요", src: HTML_LABEL_TAKE_FEVER },
  { key: "pain", category: "take", label: "통증 심할 때 복용하세요", src: HTML_LABEL_TAKE_PAIN },
  { key: "pain-fever", category: "take", label: "통증, 발열 시에만 복용하세요 / 6시간 간격 하루 4회까지", src: HTML_LABEL_TAKE_PAIN_FEVER },
  { key: "watery-diarrhea", category: "take", label: "물설사 하루 3~4회 이상 발생 시 복용", src: HTML_LABEL_TAKE_WATERY_DIARRHEA },
  { key: "headache", category: "take", label: "두통 있을 때 복용하세요", src: HTML_LABEL_TAKE_HEADACHE },
  { key: "stop-diarrhea", category: "stop", label: "설사 시 복용 중단", src: STOP_LABELS.diarrhea },
  { key: "stop-drowsy", category: "stop", label: "졸림 심하면 중단하세요", src: STOP_LABELS.drowsy },
  { key: "stop-improve", category: "stop", label: "증상 호전 시 중단 가능", src: STOP_LABELS.improve },
  { key: "stop-tremor", category: "stop", label: "떨림 시 중단하세요", src: STOP_LABELS.tremor },
  { key: "stop-fussy", category: "stop", label: "보챔 심할 시 중단하세요", src: STOP_LABELS.fussy },
  { key: "stop-loose-stool", category: "stop", label: "묽은변 호전되면 복용 중단", src: STOP_LABELS.looseStool },
  { key: "pictogram-cough", category: "pictogram", label: "기침약", src: PICTOGRAM_LABELS.cough },
  { key: "pictogram-cough-phlegm", category: "pictogram", label: "기침·가래약", src: PICTOGRAM_LABELS.coughPhlegm },
  { key: "pictogram-phlegm", category: "pictogram", label: "가래약", src: PICTOGRAM_LABELS.phlegm },
  { key: "pictogram-runny-nose", category: "pictogram", label: "콧물약", src: PICTOGRAM_LABELS.runnyNose },
  { key: "pictogram-runny-nose-itch", category: "pictogram", label: "콧물약, 가려움약", src: PICTOGRAM_LABELS.runnyNoseItch },
  { key: "pictogram-stuffy-nose", category: "pictogram", label: "코막힘약", src: PICTOGRAM_LABELS.stuffyNose },
  { key: "pictogram-inhaler", category: "pictogram", label: "흡입하는 약 (먹지 마세요)", src: PICTOGRAM_LABELS.inhaler },
  { key: "pictogram-antidiarrheal", category: "pictogram", label: "지사제", src: PICTOGRAM_LABELS.antidiarrheal },
  { key: "pictogram-antibiotic", category: "pictogram", label: "항생제", src: PICTOGRAM_LABELS.antibiotic },
  { key: "pictogram-pain-reliever", category: "pictogram", label: "진통제", src: PICTOGRAM_LABELS.painReliever },
  { key: "pictogram-constipation", category: "pictogram", label: "변비약", src: PICTOGRAM_LABELS.constipation },
  { key: "prep-augmentin-duo", category: "prep", label: "오구멘틴듀오 조제방법", src: HTML_LABEL_AUGMENTIN_DUO },
  { key: "prep-amocraneo", category: "prep", label: "아모크라네오 조제방법", src: HTML_LABEL_AMOCRANEO },
];

const labelPresetsByCategory = (category: ImageCategory) =>
  LABEL_IMAGE_PRESETS.filter((item) => item.category === category).sort((a, b) => a.label.localeCompare(b.label, "ko"));

const HTML_LABEL_STYLE = `
  .html-label { box-sizing: border-box; width: 100%; height: 100%; background: #fff; color: #000; font-family: "Malgun Gothic", Arial, sans-serif; font-weight: 800; }

  /* ===== 벤토린 흡입액 조제방법 라벨 ===== */
  .html-label-ventolin {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 2.2mm 2.5mm;
  box-sizing: border-box;
  text-align: center;
  font-weight: 900;
  letter-spacing: -0.35mm;
  line-height: 1.15; /* 전체 줄간격 소폭 증가 */
  overflow: hidden;
}

  .html-label-ventolin .html-label-title,
.html-label-title {
  width: 100%;
  text-align: center;
  font-size: 6.6mm; /* 기존 7.4 → 축소 */
  line-height: 1.2; /* 줄간격 증가 */
  margin: 0 0 3.2mm 0; /* 간격 +1mm */
  white-space: nowrap;
  font-weight: 900;
}

  .html-label-ventolin .html-label-line,
.html-label-line {
  width: 100%;
  text-align: center;
  font-size: 5.6mm; /* 기존 6.2 → 축소 */
  line-height: 1.25;
  margin: 0 0 3.4mm 0; /* +1mm */
  white-space: nowrap;
  font-weight: 900;
}

  .html-label-ventolin .html-label-warning,
.html-label-warning {
  width: 100%;
  text-align: center;
  font-size: 5.2mm; /* 기존 5.8 → 축소 */
  line-height: 1.2;
  margin: 0;
  white-space: nowrap;
  font-weight: 900;
}

  /* ===== 복용/중단 라벨 (원래 형태 복구) ===== */
  .html-repeat-label {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    height: 100%;
  }

  .html-repeat-row {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-bottom: 0.35mm dashed #000;
    padding: 0;
    line-height: 1.15;
    font-weight: 900;
  }

  .html-repeat-row:last-child {
    border-bottom: none;
  }

  .html-repeat-label.two-line .html-repeat-row {
    white-space: pre-line;
    line-height: 1.2;
  }

  /* ===== 조제방법 라벨 복구 ===== */
  .html-prep-label {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 2mm 3mm;
    height: 100%;
    box-sizing: border-box;
  }

  .html-prep-title {
    font-size: 4.8mm;
    font-weight: 900;
    margin-bottom: 1.2mm;
    text-align: center;
  }

  .html-prep-line {
    display: flex;
    align-items: flex-start;
    font-size: 3.9mm;
    line-height: 1.3;
    margin-bottom: 0.8mm;
  }

  .prep-num {
    flex: 0 0 5.2mm;
    width: 5.2mm;
    font-weight: 900;
    line-height: 1.3;
  }

  .prep-text {
    flex: 1;
    min-width: 0;
    text-align: left;
  }

  /* ===== 약종류 라벨 2열 5행 원래 형태 복구 ===== */
  .html-pictogram-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(5, 1fr);
    width: 100%;
    height: 100%;
    padding: 0;
    box-sizing: border-box;
    overflow: hidden;
  }

  .html-pictogram-cell {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 2mm;
    padding: 2mm 2mm 1mm 9mm;
    box-sizing: border-box;
    overflow: hidden;
    border-bottom: 0.35mm dashed #000;
  }

  .html-pictogram-cell:nth-child(2n-1) {
    border-right: 0.35mm dashed #000;
  }

  .html-pictogram-cell:nth-child(9),
  .html-pictogram-cell:nth-child(10) {
    border-bottom: none;
  }

  .html-pictogram-cell .html-icon {
    width: 10mm;
    height: 10mm;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .html-pictogram-cell .html-icon span,
  .html-pictogram-cell .html-icon svg {
    width: 8mm;
    height: 8mm;
    display: block;
    overflow: visible;
  }

  .html-pictogram-cell .html-icon.stuffy-nose-icon span,
  .html-pictogram-cell .html-icon.stuffy-nose-icon svg {
    width: 10mm;
    height: 10mm;
  }

  /* 코막힘약만: 아이콘+텍스트를 한 덩어리로 각 셀 중앙 정렬 */
  .html-pictogram-cell.stuffy-nose-label {
    justify-content: center;
    padding-left: 0;
    padding-right: 0;
    gap: 0;
  }

  .html-pictogram-cell.stuffy-nose-label .stuffy-nose-inner {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 2mm;
    max-width: 100%;
    overflow: hidden;
  }

  .stuffy-nose-inner .html-icon {
    width: 10mm;
    height: 10mm;
    flex: 0 0 10mm;
  }

  .stuffy-nose-inner .html-icon span,
  .stuffy-nose-inner .html-icon svg {
    width: 10mm;
    height: 10mm;
  }

  .stuffy-nose-inner .html-text {
    flex: 0 1 auto;
    min-width: 0;
    align-items: center;
    text-align: center;
  }

  .stuffy-nose-inner .title {
    font-size: 5.2mm;
    line-height: 1.05;
    text-align: center;
    white-space: nowrap;
  }

  .html-pictogram-cell .html-icon.antidiarrheal-icon span,
  .html-pictogram-cell .html-icon.antidiarrheal-icon svg {
    width: 8.5mm;
    height: 8.5mm;
  }

  .html-pictogram-cell .html-icon.constipation-icon span,
  .html-pictogram-cell .html-icon.constipation-icon svg {
    width: 7mm;
    height: 7mm;
  }

  .html-pictogram-cell .html-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    text-align: left;
  }

  .html-pictogram-cell .title {
    font-size: 5.2mm;
    font-weight: 900;
    line-height: 1.05;
    white-space: nowrap;
  }

  /* 기침·가래약만: 아이콘+텍스트를 한 덩어리로 셀 중앙 정렬 */
  .html-pictogram-cell.cough-label {
    justify-content: center;
    padding-left: 0;
    padding-right: 0;
    gap: 0;
  }

  .cough-inner {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 2mm;
    max-width: 100%;
    overflow: hidden;
  }

  .cough-inner .html-icon {
    width: 8mm;
    height: 8mm;
    flex: 0 0 8mm;
  }

  .cough-inner .html-icon span,
  .cough-inner .html-icon svg {
    width: 7.5mm;
    height: 7.5mm;
  }

  .cough-inner .html-text {
    flex: 0 1 auto;
    min-width: 0;
    align-items: center;
    text-align: center;
  }

  .cough-inner .title {
    font-size: 4.8mm;
    line-height: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }

  /* 흡입액(벤토린) 라벨: 글씨 크게 + 중앙정렬 */
  .html-pictogram-cell.inhaler-label {
    justify-content: center;
    padding-left: 0;
    padding-right: 0;
  }

  .inhaler-label .html-text {
    align-items: center;
    text-align: center;
  }

  .inhaler-label .title {
    font-size: 5.6mm;
    line-height: 1.05;
    text-align: center;
  }

  /* ===== 약종류 라벨 3줄형 원래 형태 복구: 콧물·가려움약 / 흡입하는 약 ===== */
  .html-repeat-3 {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 0;
    box-sizing: border-box;
    overflow: hidden;
  }

  .html-repeat-3 .html-row {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    border-bottom: 0.45mm solid #000;
    padding: 2mm 2mm 1mm 6mm;
    box-sizing: border-box;
    overflow: hidden;
  }

  .html-repeat-3 .html-row:last-child {
    border-bottom: none;
  }

  .html-repeat-3 .html-row.inhaler-row {
    padding-left: 10mm;
  }

  .html-repeat-3 .html-icon {
    width: 22mm;
    height: 100%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 3mm;
  }

  .html-repeat-3 .html-icon span,
  .html-repeat-3 .html-icon svg {
    display: block;
    width: 10.5mm;
    height: 10.5mm;
    overflow: visible;
  }

  .html-repeat-3 .html-icon.inhaler-icon span,
  .html-repeat-3 .html-icon.inhaler-icon svg {
    width: 10.5mm;
    height: 10.5mm;
  }

  .html-repeat-3 .html-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    text-align: left;
  }

  .html-repeat-3 .title {
    font-size: 6mm;
    font-weight: 900;
    line-height: 1.05;
    white-space: nowrap;
  }

  .html-repeat-3 .sub {
    font-size: 4.6mm;
    font-weight: 900;
    line-height: 1.05;
    margin-top: 1mm;
    white-space: nowrap;
  }

  .html-repeat-3 .inhaler-row .title {
    font-size: 5.8mm;
    line-height: 1.15;
    white-space: normal;
  }

  /* ===== 해열제 라벨 유지 ===== */
  .html-label-detail-split {
    display: grid;
    grid-template-rows: 22mm 4mm 22mm;
    align-items: stretch;
    justify-content: stretch;
    padding: 0;
    letter-spacing: -0.2mm;
  }

  .html-detail-half {
    box-sizing: border-box;
    padding: 2mm 2mm 0.6mm 9mm;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 3mm;
    overflow: hidden;
  }

  .html-detail-icon-svg {
    width: 11mm;
    height: 11mm;
    flex-shrink: 0;
  }

  .html-detail-title {
    font-size: 5.1mm;
    line-height: 1.0;
    font-weight: 900;
  }

  .html-detail-line {
    font-size: 4.25mm;
    line-height: 1.15;
    font-weight: 900;
  }

  .html-cut-space {
    height: 4mm;
    display: flex;
    align-items: center;
    padding: 0 3mm;
  }

  .html-cut-space::before {
    content: "";
    display: block;
    width: 100%;
    border-top: 0.35mm dashed #000;
  }
`;

const versionedSrc = (src: string): string => encodeURI(`${src}?v=${IMAGE_ASSET_VERSION}`);
const isHtmlLabel = (src: string): boolean => src.startsWith("html:");
const getPresetLabel = (src: string): string => LABEL_IMAGE_PRESETS.find((p) => p.src === src)?.label ?? "";

const feverIconSvgMarkup = `
<svg width="800px" height="800px" viewBox="0 0 100 100" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg">
  <defs><style>.cls-1{fill:none;stroke:#000000;stroke-linejoin:round;stroke-width:2px;}</style></defs>
  <path class="cls-1" d="M35.32,17.58,63,45.23a5,5,0,0,1,1.1,1.6C65.33,49.72,69.41,59,72.24,65a31.32,31.32,0,0,0,6.27,8.94l2.94,2.94-4.58,4.58-2.94-2.94A31.32,31.32,0,0,0,65,72.24c-6-2.83-15.27-6.91-18.16-8.18a5,5,0,0,1-1.6-1.1L17.58,35.32a9.65,9.65,0,0,1-2.09-10.5,17.29,17.29,0,0,1,9.33-9.33,9.68,9.68,0,0,1,10.5,2.09Z"/>
  <path class="cls-1" d="M41.43,29.66l12,12a5.41,5.41,0,0,1,1.18,5.91,13,13,0,0,1-7,7,5.44,5.44,0,0,1-5.9-1.18l-12-12a5.42,5.42,0,0,1-1.17-5.91,13,13,0,0,1,7-7,5.48,5.48,0,0,1,3.13-.3A5.4,5.4,0,0,1,41.43,29.66Z"/>
  <path class="cls-1" d="M25.27,43a7.92,7.92,0,0,1-1.72-8.62L24,33.32A17.2,17.2,0,0,1,33.32,24l1.06-.44A7.92,7.92,0,0,1,43,25.27"/>
  <path class="cls-1" d="M78.49,78.1H85a0,0,0,0,1,0,0v4a3.24,3.24,0,0,1-3.24,3.24h0a3.24,3.24,0,0,1-3.24-3.24v-4A0,0,0,0,1,78.49,78.1Z" transform="translate(-33.85 81.73) rotate(-45)"/>
  <rect class="cls-1" height="11.01" transform="translate(-18.42 44.48) rotate(-45)" width="8.21" x="40.37" y="38.97"/>
  <circle class="cls-1" cx="36.44" cy="36.39" r="2.91"/>
</svg>
`;

const coughIconMarkup = `
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" id="cough" aria-label="기침약">
    <path fill="#000" d="m30.129 54.058.983.185-.92 4.897-.983-.185z"></path>
    <path fill="#000" d="m8.856 59.153-.979-.207c.073-.347.21-.915.385-1.643.9-3.753 3.293-13.724 1.992-16.046l-.123-.219c-2.256-4.021-5.666-10.097-5.07-18.252.381-5.218 2.662-9.882 6.423-13.132 3.796-3.281 8.834-4.875 14.175-4.482 12.105.885 19.407 8.563 18.604 19.562l-.416 3.219 4.015 9.746c.183.5.103 1.029-.206 1.437a1.466 1.466 0 0 1-1.306.591l-4.206-.307c-.048.773-.09 2.307.227 3.338l-.384.638-5.763 1.094 4.541 1.543.18.839c-.591.55-.934 1.776-.991 3.544a3.559 3.559 0 0 1-1.316 2.653 3.48 3.48 0 0 1-2.806.716l-5.332-.961.178-.984 5.332.961a2.437 2.437 0 0 0 2-.51c.575-.464.92-1.16.944-1.908.053-1.6.328-2.816.82-3.631l-5.668-1.927.067-.965 7.108-1.35c-.312-1.58-.104-3.586-.094-3.681l.533-.445 4.701.344a.49.49 0 0 0 .437-.197.492.492 0 0 0 .071-.472l-4.058-9.849-.034-.254.43-3.323c.602-8.243-3.725-17.444-17.681-18.464-5.092-.371-9.856 1.135-13.448 4.241-3.558 3.076-5.717 7.497-6.078 12.449-.574 7.855 2.747 13.773 4.944 17.69l.124.219c1.314 2.347-.22 9.793-1.894 16.768-.171.716-.305 1.276-.378 1.617z"></path>
    <path fill="#000" d="m32.062 53.113-8.466-1.616c-2.971-.542-4.956-3.405-4.423-6.382l.091-.506.984.177-.091.506a4.508 4.508 0 0 0 3.622 5.222l8.47 1.617-.187.982zM40.882 29.293l-4.488-.328.072-.997 2.533.185-3.618-2.331.541-.841 5.266 3.394zM55.353 39.941l.301.953-8.169 2.578-.3-.953zM48.274 46.948l7.459 2.843-.357.934-7.458-2.843zM44.63 50.186l6.082 7.235-.765.643-6.083-7.234zM52 44h1v1h-1zM52 59h1v1h-1zM54 55h1v1h-1zM55 57h1v1h-1zM57 51h1v1h-1zM57 42h1v1h-1zM54 45h1v1h-1z"></path>
  </svg>
`;
const phlegmIconMarkup = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" id="sick">
  <path fill="#37474F" d="m35.416 52.2.994.104-.716 6.795-.994-.104zM42.791 51h-7.593l.002-1h7.591c.732 0 1.398-.304 1.877-.857a2.555 2.555 0 0 0 .591-2.043c-.297-2.05-.115-3.534.54-4.408l.801.6c-.484.645-.605 1.912-.351 3.665a3.557 3.557 0 0 1-.825 2.842A3.481 3.481 0 0 1 42.791 51zm-28.435 8.153-.979-.207c1.367-6.472 2.488-14.75 1.148-16.782l-.139-.21C11.844 38.108 8 32.297 8 24.121 8 13.25 16.279 5.052 27.259 5.052c12.138 0 19.98 7.126 19.98 18.154l-.181 3.241 4.715 9.427a1.502 1.502 0 0 1-1.361 2.132h-4.217c.008.774.077 2.308.469 3.313l-.41.679-4.5.5-.111-.994 3.895-.433c-.401-1.541-.342-3.488-.339-3.581l.5-.483h4.714a.493.493 0 0 0 .42-.228.495.495 0 0 0 .037-.477l-4.766-9.526-.052-.251.188-3.346c-.001-8.265-4.987-17.126-18.981-17.126C16.85 6.052 9 13.82 9 24.121c0 7.875 3.744 13.536 6.222 17.282l.139.21c1.899 2.877-.289 14.153-1.005 17.54z"></path>
  <path fill="#37474F" d="M44.199 28h-4.5v-1h2.539l-3.778-2.061.478-.878 5.5 3zM27 54.5c-.34 0-.676-.02-1.006-.059l.117-.993c.59.069 1.213.07 1.807-.003l.121.993A8.704 8.704 0 0 1 27 54.5zm-2.995-.543a8.477 8.477 0 0 1-1.815-.948l.566-.824a7.468 7.468 0 0 0 1.601.837l-.352.935zm6.023-.013-.357-.934a7.52 7.52 0 0 0 1.596-.843l.57.822c-.562.39-1.17.712-1.809.955zm-9.374-2.289a8.535 8.535 0 0 1-1.169-1.678l.883-.47A7.6 7.6 0 0 0 21.4 50.99l-.746.665zm12.713-.023-.748-.664a7.49 7.49 0 0 0 1.026-1.486l.885.465a8.425 8.425 0 0 1-1.163 1.685zm-14.615-3.569a8.582 8.582 0 0 1-.252-2.03l1-.005c.003.607.077 1.211.223 1.793l-.971.242zm16.503-.031-.971-.238A7.509 7.509 0 0 0 34.5 46l1-.062V46c0 .686-.082 1.37-.245 2.032zm-15.546-3.797L18.736 44a8.41 8.41 0 0 1 .719-1.917l.887.461a7.444 7.444 0 0 0-.633 1.691zm14.563-.084a7.507 7.507 0 0 0-.653-1.684l.881-.472c.322.602.572 1.244.741 1.908l-.969.248zm-12.909-3.098-.752-.66a8.63 8.63 0 0 1 1.523-1.364l.574.819a7.632 7.632 0 0 0-1.345 1.205zm11.217-.064a7.488 7.488 0 0 0-1.36-1.189l.564-.826a8.527 8.527 0 0 1 1.54 1.348l-.744.667zM24.302 39l-.359-.933a8.394 8.394 0 0 1 1.984-.5l.125.992a7.378 7.378 0 0 0-1.75.441zm5.314-.031a7.477 7.477 0 0 0-1.757-.42l.113-.993c.68.077 1.35.238 1.991.476l-.347.937zM27 50.5c-2.481 0-4.5-2.019-4.5-4.5s2.019-4.5 4.5-4.5 4.5 2.019 4.5 4.5-2.019 4.5-4.5 4.5zm0-8c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zM52.262 59.152l-4.976-1.588-.311 1.484-7.647-2.678.33-.944 6.572 2.302.304-1.453 6.032 1.924zM45.75 55.141l-5.621-1.406.242-.97 4.379 1.094v-1.423l8.872 1.067-.119.994-7.753-.933z"></path>
</svg>
`;
const coughPhlegmIconMarkup = phlegmIconMarkup;
const noseIconMarkup = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" id="runny-nose">
  <path fill="#37474F" d="m36.409 52.202.994.103-.709 6.796-.995-.103zM43.792 51.008h-.004L37.199 51l.001-1 6.589.008h.003c.731 0 1.397-.304 1.875-.856.484-.559.7-1.304.592-2.044-.299-2.049-.117-3.532.54-4.408l.8.6c-.484.646-.605 1.913-.35 3.664a3.556 3.556 0 0 1-.826 2.843 3.479 3.479 0 0 1-2.631 1.201zm-28.436 8.145-.979-.207c1.369-6.471 2.491-14.749 1.148-16.782l-.14-.212C12.843 38.106 9 32.295 9 24.121 9 13.25 17.28 5.052 28.259 5.052c12.137 0 19.979 7.126 19.979 18.154l-.18 3.241 4.714 9.427a1.501 1.501 0 0 1-1.36 2.133h-4.217c.008.774.078 2.308.469 3.313l-.411.678-4.5.5-.11-.994 3.895-.433c-.401-1.541-.342-3.488-.339-3.581l.5-.483h4.714a.492.492 0 0 0 .42-.228.49.49 0 0 0 .036-.476l-4.765-9.527-.052-.251.187-3.346c-.001-8.265-4.987-17.126-18.98-17.126C17.85 6.052 10 13.82 10 24.121c0 7.874 3.743 13.534 6.22 17.28l.141.212c1.9 2.879-.289 14.153-1.005 17.54z"></path>
  <path fill="#37474F" d="M30.186 51.014a5.51 5.51 0 0 1-5.486-5.5V45h1v.514a4.508 4.508 0 0 0 4.487 4.5L42.699 50l.001 1-12.514.014zM45.199 28h-4.5v-1h2.539l-3.778-2.061.478-.878 5.5 3zM52 51c-1.654 0-3-1.346-3-3 0-1.455 2.29-6.185 2.551-6.719l.449-.92.449.92C52.71 41.815 55 46.545 55 48c0 1.654-1.346 3-3 3zm0-8.337c-.909 1.952-2 4.552-2 5.337 0 1.103.897 2 2 2s2-.897 2-2c0-.785-1.091-3.386-2-5.337z"></path>
</svg>
`;
const stuffyNoseIconMarkup = `
<svg fill="#000000" width="800px" height="800px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" id="Layer_1" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <g>
    <path d="M32.5,67.3c1.5,0,3-0.7,4.4-2.2c0.5-0.5,1-0.7,1.7-0.7c1.7,0,4,1.3,5.8,2.3c1,0.6,2,1.1,2.9,1.5s1.8,0.5,2.7,0.5   s1.8-0.2,2.7-0.5s1.8-0.9,2.9-1.5c1.8-1,4.1-2.3,5.8-2.3c0.7,0,1.2,0.2,1.7,0.7c1.4,1.4,2.9,2.2,4.4,2.2c1.1,0,2.6-0.4,4-2.1   c1.7-2.2,2.6-6.1,1.9-8.7c-0.5-2-2.6-4.9-5.1-8.2c-2.3-3.1-5.1-6.9-5.5-8.7c-0.1-0.6-0.3-1.5-0.4-2.5c-0.9-6.1-2.8-18.8-12.4-18.8   S38.5,30.9,37.6,37c-0.2,1-0.3,1.9-0.4,2.5c-0.4,1.9-3.2,5.7-5.5,8.7c-2.5,3.3-4.6,6.2-5.1,8.2c-0.6,2.6,0.2,6.5,1.9,8.7   C29.9,66.9,31.4,67.3,32.5,67.3z M30.5,57.4c0.3-1.2,2.6-4.3,4.4-6.8c2.9-3.9,5.6-7.6,6.2-10.3c0.2-0.7,0.3-1.7,0.5-2.8   c0.8-5.4,2.3-15.4,8.4-15.4s7.6,10,8.4,15.4c0.2,1.1,0.3,2.1,0.5,2.8c0.6,2.7,3.3,6.4,6.2,10.3c1.8,2.5,4.1,5.5,4.4,6.8   c0.3,1.3-0.2,3.9-1.2,5.3c-0.2,0.2-0.5,0.6-0.8,0.6c-0.1,0-0.7-0.1-1.6-1c-1.2-1.2-2.7-1.9-4.5-1.9c-2.8,0-5.6,1.6-7.8,2.9   c-0.9,0.5-1.7,1-2.3,1.2c-0.8,0.3-1.7,0.3-2.5,0c-0.6-0.2-1.4-0.7-2.3-1.2c-2.2-1.3-5-2.9-7.8-2.9c-1.8,0-3.3,0.6-4.5,1.9   c-0.9,0.9-1.5,1-1.6,1c-0.3,0-0.6-0.4-0.8-0.6C30.6,61.3,30.1,58.7,30.5,57.4z"/>
    <path d="M38.4,66.7l-1.3,0l-2.8,5.1c-1.1,2.1-1.3,4.7-0.3,6.8c0.9,2,2.5,3.2,4.3,3.2s3.4-1.2,4.3-3.2c1-2.1,0.9-4.6-0.3-6.8   l-2.2-4.1C39.9,67.1,39.2,66.7,38.4,66.7z M39.1,76.9c-0.3,0.6-0.6,0.8-0.7,0.9c-0.1,0-0.4-0.3-0.7-0.9c-0.4-1-0.4-2.1,0.2-3.2   l0.5-0.9l0.5,0.9C39.5,74.8,39.5,76,39.1,76.9z"/>
  </g>
</svg>
`;
const inhalerIconMarkup = `
<svg fill="#000000" height="800px" width="800px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 193.851 193.851" xml:space="preserve">
  <path d="M176.84,133.23h-50.168L83.126,28.094c-0.761-1.838-2.222-3.298-4.06-4.06c-1.838-0.761-3.904-0.761-5.741,0.001
  l-7.871,3.262L56.066,4.63c-0.761-1.838-2.222-3.298-4.06-4.06c-1.838-0.76-3.903-0.761-5.741,0.001l-29.59,12.261
  c-1.838,0.762-3.298,2.222-4.059,4.06c-0.761,1.838-0.76,3.902,0.002,5.74l9.395,22.663l-7.872,3.262
  c-3.826,1.585-5.643,5.972-4.058,9.799l54.201,130.865c1.161,2.803,3.896,4.63,6.929,4.63H176.84c4.142,0,7.5-3.357,7.5-7.5V140.73
  C184.34,136.588,180.982,133.23,176.84,133.23z M45.078,17.3l6.517,15.733l-15.726,6.515l-6.521-15.73L45.078,17.3z M26.812,59.545
  l45.326-18.781L114.731,143.6c1.161,2.803,3.896,4.63,6.929,4.63h11.057v30.621h-56.49L26.812,59.545z M169.34,178.851h-21.623
  V148.23h21.623V178.851z"/>
</svg>
`;
const antidiarrhealIconMarkup = `
<svg fill="#000000" width="800px" height="800px" viewBox="-12.35 0 122.88 122.88" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="enable-background:new 0 0 98.18 122.88" xml:space="preserve">
  <g>
    <path d="M21.58,24.97c0-1.01,0.82-1.82,1.82-1.82c1.01,0,1.82,0.82,1.82,1.82v33.33c0,1.01-0.82,1.82-1.82,1.82H1.82 C0.82,60.13,0,59.31,0,58.31V3.92c0-1.07,0.44-2.05,1.15-2.77l0.01-0.01C1.88,0.44,2.85,0,3.93,0H21.3c1.07,0,2.06,0.44,2.77,1.16 l0,0c0.71,0.71,1.15,1.69,1.15,2.77v4.62c0,1.01-0.82,1.82-1.82,1.82c-1.01,0-1.82-0.82-1.82-1.82V3.92c0-0.07-0.03-0.14-0.08-0.2 l0,0l0,0c-0.05-0.05-0.12-0.08-0.2-0.08H3.93c-0.08,0-0.15,0.03-0.2,0.08L3.72,3.73c-0.05,0.05-0.08,0.12-0.08,0.2v52.56h17.94 V24.97L21.58,24.97z M21.57,99.88L0.21,59.15c-0.46-0.89-0.12-1.98,0.77-2.45c0.27-0.14,0.56-0.21,0.84-0.21v-0.01h94.53 c1.01,0,1.82,0.82,1.82,1.82c0,0.07,0,0.14-0.01,0.21c-0.51,21.74-11.17,27.86-20.14,33c-5.24,3.01-9.83,5.64-10.69,11.21 l-0.01,0.05c-0.33,2.18-0.15,4.68,0.54,7.51c0.72,2.95,1.99,6.27,3.84,9.96c0.45,0.9,0.08,1.99-0.82,2.44 c-0.26,0.13-0.54,0.19-0.81,0.19l-57.06,0c-1.01,0-1.82-0.82-1.82-1.82c0-0.35,0.1-0.68,0.28-0.96L21.57,99.88L21.57,99.88z M4.83,60.13l20.39,38.89c0.26,0.5,0.28,1.11,0.01,1.65l-9.28,18.57h51.24c-1.3-2.89-2.25-5.59-2.86-8.09 c-0.81-3.32-1.01-6.29-0.61-8.91l0.01-0.06c1.13-7.3,6.43-10.34,12.48-13.81c7.92-4.54,17.29-9.92,18.26-28.23H4.83L4.83,60.13z M23.61,101.68c-1.01,0-1.82-0.82-1.82-1.82c0-1.01,0.82-1.82,1.82-1.82H43.5c1.01,0,1.82,0.82,1.82,1.82 c0,1.01-0.82,1.82-1.82,1.82H23.61L23.61,101.68z M25.21,58.58c-0.15,0.99-1.08,1.68-2.07,1.53c-0.99-0.15-1.68-1.08-1.53-2.07 c0.29-1.88,0.76-3.58,1.42-5.07c0.69-1.55,1.58-2.86,2.67-3.93c3.54-3.46,8.04-3.38,12.34-3.3c0.38,0.01,0.75,0.01,1.72,0.01 l38.96,0c9.24-0.06,19.48-0.13,19.43,13c0,1-0.81,1.81-1.81,1.81s-1.81-0.81-1.81-1.81c0.04-9.48-8.28-9.42-15.78-9.37 c-1.13,0.01-1.1,0.02-1.77,0.02H39.77l-1.78-0.03c-3.56-0.06-7.29-0.13-9.75,2.28c-0.77,0.75-1.39,1.68-1.89,2.79 C25.83,55.6,25.45,56.98,25.21,58.58L25.21,58.58z M15.33,11.17c2.83,0,5.12,2.29,5.12,5.12c0,2.83-2.29,5.12-5.12,5.12 c-2.83,0-5.12-2.29-5.12-5.12C10.21,13.46,12.51,11.17,15.33,11.17L15.33,11.17z M20.45,18.11c-1.01,0-1.82-0.82-1.82-1.82 c0-1.01,0.82-1.82,1.82-1.82h12.28c1.01,0,1.82,0.82,1.82,1.82c0,1.01-0.82,1.82-1.82,1.82H20.45L20.45,18.11z"/>
  </g>
</svg>
`;
const antibioticIconMarkup = `
<svg fill="#000000" width="800px" height="800px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" id="Layer_1" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <g>
    <path d="M45.3,33.4c-3.7,0-6.8,3-6.8,6.8s3,6.8,6.8,6.8s6.8-3,6.8-6.8S49,33.4,45.3,33.4z M45.3,42.9c-1.5,0-2.8-1.2-2.8-2.8   s1.2-2.8,2.8-2.8s2.8,1.2,2.8,2.8S46.8,42.9,45.3,42.9z"/>
    <path d="M54.4,50c0,3.7,3,6.8,6.8,6.8s6.8-3,6.8-6.8s-3-6.8-6.8-6.8S54.4,46.3,54.4,50z M63.9,50c0,1.5-1.2,2.8-2.8,2.8   s-2.8-1.2-2.8-2.8s1.2-2.8,2.8-2.8S63.9,48.5,63.9,50z"/>
    <path d="M42.4,50.9c-3.7,0-6.8,3-6.8,6.8s3,6.8,6.8,6.8s6.8-3,6.8-6.8S46.1,50.9,42.4,50.9z M42.4,60.4c-1.5,0-2.8-1.2-2.8-2.8   s1.2-2.8,2.8-2.8s2.8,1.2,2.8,2.8S43.9,60.4,42.4,60.4z"/>
    <path d="M83.8,43.3c-3,0-5.6,2-6.4,4.8h-3.4c-0.4-5.1-2.5-9.8-5.6-13.5l2.4-2.4c1,0.5,2,0.8,3.1,0.8c1.8,0,3.5-0.7,4.8-2   c2.6-2.6,2.6-6.9,0-9.5c-1.3-1.3-3-2-4.8-2c-1.8,0-3.5,0.7-4.8,2c-2.1,2.1-2.5,5.4-1.2,7.9l-2.4,2.4c-3.7-3.1-8.4-5.2-13.5-5.6   v-3.4c2.7-0.9,4.8-3.4,4.8-6.4c0-3.7-3-6.8-6.8-6.8s-6.8,3-6.8,6.8c0,3,2,5.6,4.8,6.4v3.4c-5.1,0.4-9.8,2.5-13.5,5.6l-2.4-2.4   c1.3-2.5,0.9-5.8-1.2-7.9c-1.3-1.3-3-2-4.8-2c-1.8,0-3.5,0.7-4.8,2c-2.6,2.6-2.6,6.9,0,9.5c1.3,1.3,3,2,4.8,2   c1.1,0,2.2-0.3,3.1-0.8l2.4,2.4c-3.1,3.7-5.2,8.4-5.6,13.5h-3.4c-0.9-2.7-3.4-4.8-6.4-4.8c-3.7,0-6.8,3-6.8,6.8s3,6.8,6.8,6.8   c3,0,5.6-2,6.4-4.8h3.4c0.4,5.1,2.5,9.8,5.6,13.5l-2.4,2.4c-1-0.5-2-0.8-3.1-0.8c-1.8,0-3.5,0.7-4.8,2c-2.6,2.6-2.6,6.9,0,9.5   c1.3,1.3,3,2,4.8,2c1.8,0,3.5-0.7,4.8-2c2.1-2.1,2.5-5.4,1.2-7.9l2.4-2.4c3.7,3.1,8.4,5.2,13.5,5.6v3.4c-2.7,0.9-4.8,3.4-4.8,6.4   c0,3.7,3,6.8,6.8,6.8s6.8-3,6.8-6.8c0-3-2-5.6-4.8-6.4v-3.4c5.1-0.4,9.8-2.5,13.5-5.6l2.4,2.4c-1.3,2.5-0.9,5.8,1.2,7.9   c1.3,1.3,3,2,4.8,2c1.8,0,3.5-0.7,4.8-2c2.6-2.6,2.6-6.9,0-9.5c-1.3-1.3-3-2-4.8-2c-1.1,0-2.2,0.3-3.1,0.8l-2.4-2.4   c3.1-3.7,5.2-8.4,5.6-13.5h3.4c0.9,2.7,3.4,4.8,6.4,4.8c3.7,0,6.8-3,6.8-6.8S87.5,43.3,83.8,43.3z M71.9,24.2   c0.5-0.5,1.2-0.8,1.9-0.8c0.7,0,1.4,0.3,1.9,0.8c1.1,1.1,1.1,2.8,0,3.9c-1,1-2.9,1-3.9,0C70.8,27,70.8,25.3,71.9,24.2z M50,13.5   c1.5,0,2.8,1.2,2.8,2.8S51.5,19,50,19s-2.8-1.2-2.8-2.8S48.5,13.5,50,13.5z M24.2,28.1c-1.1-1.1-1.1-2.8,0-3.9   c0.5-0.5,1.2-0.8,1.9-0.8c0.7,0,1.4,0.3,1.9,0.8c1.1,1.1,1.1,2.8,0,3.9C27,29.1,25.2,29.1,24.2,28.1z M16.3,52.8   c-1.5,0-2.8-1.2-2.8-2.8s1.2-2.8,2.8-2.8S19,48.5,19,50S17.8,52.8,16.3,52.8z M28.1,75.8c-1,1-2.9,1-3.9,0c-1.1-1.1-1.1-2.8,0-3.9   c0.5-0.5,1.2-0.8,1.9-0.8c0.7,0,1.4,0.3,1.9,0.8C29.2,73,29.2,74.7,28.1,75.8z M50,86.5c-1.5,0-2.8-1.2-2.8-2.8S48.5,81,50,81   s2.8,1.2,2.8,2.8S51.5,86.5,50,86.5z M75.8,71.9c1.1,1.1,1.1,2.8,0,3.9c-1,1-2.9,1-3.9,0c-1.1-1.1-1.1-2.8,0-3.9   c0.5-0.5,1.2-0.8,1.9-0.8C74.6,71.1,75.3,71.4,75.8,71.9z M50,70c-11,0-20-9-20-20s9-20,20-20s20,9,20,20S61,70,50,70z M83.8,52.8   c-1.5,0-2.8-1.2-2.8-2.8s1.2-2.8,2.8-2.8s2.8,1.2,2.8,2.8S85.3,52.8,83.8,52.8z"/>
  </g>
</svg>
`;
const painIconMarkup = `
<svg width="800px" height="800px" viewBox="0 0 100 100" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg">
  <defs><style>.cls-1{fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px;}</style></defs>
  <path class="cls-1" d="M72.87,41.5V80.6a4.19,4.19,0,0,1-4.18,4.19H31.31a4.19,4.19,0,0,1-4.18-4.19V41.5a15.69,15.69,0,0,1,9.11-14.25H63.76A15.69,15.69,0,0,1,72.87,41.5Z"/>
  <path class="cls-1" d="M68.69,70.13v8.38a2.1,2.1,0,0,1-2.1,2.09H33.41a2.1,2.1,0,0,1-2.1-2.09V70.13Z"/>
  <path class="cls-1" d="M68.69,41.5v.4H31.31v-.4a11.54,11.54,0,0,1,5.92-10.06H62.77A11.54,11.54,0,0,1,68.69,41.5Z"/>
  <rect class="cls-1" height="28.23" width="45.75" x="27.13" y="41.9"/>
  <rect class="cls-1" height="4.19" width="27.58" x="36.21" y="23.06"/>
  <path class="cls-1" d="M36.51,15.21h27a2.62,2.62,0,0,1,2.62,2.62v5.23a0,0,0,0,1,0,0H33.89a0,0,0,0,1,0,0V17.83A2.62,2.62,0,0,1,36.51,15.21Z"/>
  <polygon class="cls-1" points="58.33 52.48 58.33 59.55 53.53 59.55 53.53 64.34 46.47 64.34 46.47 59.55 41.67 59.55 41.67 52.48 46.47 52.48 46.47 47.69 53.53 47.69 53.53 52.48 58.33 52.48"/>
  <line class="cls-1" x1="50" x2="50" y1="15.21" y2="23.06"/>
  <line class="cls-1" x1="44.63" x2="44.63" y1="15.21" y2="23.06"/>
  <line class="cls-1" x1="39.26" x2="39.26" y1="15.21" y2="23.06"/>
  <line class="cls-1" x1="60.74" x2="60.74" y1="15.21" y2="23.06"/>
  <line class="cls-1" x1="55.37" x2="55.37" y1="15.21" y2="23.06"/>
</svg>
`;
const constipationIconMarkup = `
<svg fill="#000000" height="800px" width="800px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 223.453 223.453" xml:space="preserve">
  <path d="M189.833,126.944c9.401-6.883,15.518-17.998,15.518-30.516c0-20.843-16.956-37.8-37.799-37.8h-29.059
  c5.089-6.439,8.128-14.567,8.128-23.392V22.5c0-12.406-10.093-22.5-22.5-22.5c-12.407,0-22.5,10.094-22.5,22.5v5.533h-45.94
  c-20.842,0-37.799,16.956-37.799,37.798c0,13.372,6.98,25.145,17.489,31.865c-8.524,6.937-13.979,17.507-13.979,29.327
  c0,20.843,16.957,37.799,37.8,37.799h35.712c-5.089,6.439-8.13,14.569-8.13,23.396v12.735c0,12.406,10.093,22.5,22.5,22.5
  s22.5-10.094,22.5-22.5v-5.533h36c20.842,0,37.799-16.956,37.799-37.798C205.571,145.006,199.359,133.814,189.833,126.944z
  M167.773,180.42h-43.201c-4.3,0-7.799,3.498-7.799,7.798v12.735c0,4.136-3.364,7.5-7.5,7.5c-4.135,0-7.5-3.364-7.5-7.5v-12.735
  c0-12.57,10.228-22.798,22.799-22.798h43.201c4.3,0,7.799-3.498,7.799-7.798c0-4.301-3.499-7.8-7.799-7.8H59.191
  c-12.572,0-22.8-10.227-22.8-22.799c0-12.57,10.228-22.797,22.8-22.797h108.36c4.3,0,7.799-3.498,7.799-7.798
  c0-4.301-3.499-7.8-7.799-7.8H55.681c-12.571,0-22.799-10.228-22.799-22.798s10.228-22.798,22.799-22.798h53.143
  c4.3,0,7.798-3.498,7.798-7.797V22.5c0-4.136,3.365-7.5,7.5-7.5c4.136,0,7.5,3.364,7.5,7.5v12.736
  c0,12.57-10.227,22.797-22.798,22.797H55.681c-4.3,0-7.799,3.498-7.799,7.798s3.499,7.798,7.799,7.798h111.871
  c12.571,0,22.799,10.228,22.799,22.8c0,12.57-10.228,22.798-22.799,22.798H59.191c-4.301,0-7.8,3.498-7.8,7.797
  c0,4.3,3.499,7.799,7.8,7.799h108.581c12.571,0,22.799,10.228,22.799,22.8C190.571,170.192,180.344,180.42,167.773,180.42z"/>
</svg>
`;
const pillIconMarkup = `
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="24" width="40" height="16" rx="8" stroke="#000" stroke-width="5" fill="none" />
    <line x1="32" y1="24" x2="32" y2="40" stroke="#000" stroke-width="5" />
  </svg>
`;

const FeverIconSvg = () => <span dangerouslySetInnerHTML={{ __html: feverIconSvgMarkup }} />;
const SvgIcon = ({ markup }: { markup: string }) => <span dangerouslySetInnerHTML={{ __html: markup }} />;

const isThreeRowPictogram = (src: string): boolean =>
  src === PICTOGRAM_LABELS.runnyNoseItch || src === PICTOGRAM_LABELS.inhaler;

const getPictogramIconMarkup = (src: string): string => {
  const key = src.replace("html:pictogram-", "");
  return key === "cough" ? coughIconMarkup :
    key === "phlegm" ? phlegmIconMarkup :
    key === "cough-phlegm" ? coughPhlegmIconMarkup :
    key === "runny-nose" ? noseIconMarkup :
    key === "runny-nose-itch" ? noseIconMarkup :
    key === "stuffy-nose" ? stuffyNoseIconMarkup :
    key === "inhaler" ? inhalerIconMarkup :
    key === "antidiarrheal" ? antidiarrhealIconMarkup :
    key === "antibiotic" ? antibioticIconMarkup :
    key === "pain-reliever" ? painIconMarkup :
    key === "constipation" ? constipationIconMarkup :
    pillIconMarkup;
};

const getPictogramMarkup = (src: string): string => {
  const label = getPresetLabel(src);
  const icon = getPictogramIconMarkup(src);

  if (isThreeRowPictogram(src)) {
    const rows = Array.from({ length: 3 }, () => `
      <div class="html-row">
        <div class="html-icon${src === PICTOGRAM_LABELS.antidiarrheal ? " antidiarrheal-icon" : src === PICTOGRAM_LABELS.constipation ? " constipation-icon" : src === PICTOGRAM_LABELS.inhaler ? " inhaler-icon" : ""}">${icon}</div>
        <div class="html-text">
          <div class="title">${label === "흡입하는 약 (먹지 마세요)" ? "흡입하는 약<br>(먹지 마세요)" : label}</div>
          ${label.includes("콧물") || label.includes("가려움") ? `<div class="sub">졸림 심하면 중단</div>` : ""}
        </div>
      </div>
    `).join("");
    return `<div class="html-label html-repeat-3">${rows}</div>`;
  }

  const cells = Array.from({ length: 10 }, () => `
    <div class="html-pictogram-cell ${label === "기침·가래약" ? "cough-label" : src === PICTOGRAM_LABELS.stuffyNose ? "stuffy-nose-label" : ""}">
      ${label === "기침·가래약" ? `<div class="cough-inner"><div class="html-icon">${icon}</div><div class="html-text"><div class="title">${label}</div></div></div>` : src === PICTOGRAM_LABELS.stuffyNose ? `<div class="stuffy-nose-inner"><div class="html-icon stuffy-nose-icon">${icon}</div><div class="html-text"><div class="title">${label}</div></div></div>` : `<div class="html-icon${src === PICTOGRAM_LABELS.antidiarrheal ? " antidiarrheal-icon" : src === PICTOGRAM_LABELS.constipation ? " constipation-icon" : src === PICTOGRAM_LABELS.inhaler ? " inhaler-icon" : ""}">${icon}</div><div class="html-text"><div class="title">${label}</div></div>`}
    </div>
  `).join("");
  return `<div class="html-label html-pictogram-grid">${cells}</div>`;
};

const ventolinLabelHtml = `
  <div class="html-label html-label-ventolin">
    <div class="html-label-title">벤토린 흡입액</div>
    <div class="html-label-line">벤토린 (　　　) + 풀미칸 (　　　)</div>
    <div class="html-label-line">섞어서 하루 (　　　)회 흡입 치료</div>
    <div class="html-label-warning">*경구로 섭취하지 마세요</div>
  </div>
`;

const feverDetailLabelHtml = `
  <div class="html-label html-label-detail-split">
    <div class="html-detail-half"><div class="html-detail-icon-svg">${feverIconSvgMarkup}</div><div class="html-detail-text"><div class="html-detail-title">해열제</div><div class="html-detail-line">· 37.5℃ 이상 발열 시 복용</div><div class="html-detail-line">· 최소간격 4시간</div><div class="html-detail-line">· 하루 3회 까지</div></div></div>
    <div class="html-cut-space"></div>
    <div class="html-detail-half"><div class="html-detail-icon-svg">${feverIconSvgMarkup}</div><div class="html-detail-text"><div class="html-detail-title">해열제</div><div class="html-detail-line">· 37.5℃ 이상 발열 시 복용</div><div class="html-detail-line">· 최소간격 4시간</div><div class="html-detail-line">· 하루 3회 까지</div></div></div>
  </div>
`;

const prepLabelHtml = (title: string) => `
  <div class="html-label html-prep-label">
    <div class="html-prep-title">〈${title}〉</div>
    <div class="html-prep-line"><span class="prep-num">①</span><span class="prep-text">먼저 조제된 시럽부터 복용하세요.</span></div>
    <div class="html-prep-line"><span class="prep-num">②</span><span class="prep-text">시럽병 표시선의 2/3까지 물을 부어<br>잘 섞으세요.</span></div>
    <div class="html-prep-line"><span class="prep-num">③</span><span class="prep-text">표시선(50mL)까지 물을 채우고,<br>잘 흔들어 복용하세요.</span></div>
    <div class="html-prep-line"><span class="prep-num">④</span><span class="prep-text">조제된 시럽은 〈냉장보관〉 하세요.</span></div>
  </div>
`;
const augmentinDuoLabelHtml = prepLabelHtml("오구멘틴듀오 건조 시럽");
const amocraneoLabelHtml = prepLabelHtml("아모크라네오 건조 시럽");

const repeatLabelHtml = (text: string, count = 5, className = "") => `
  <div class="html-label html-repeat-label ${className}" style="--repeat-count:${count}">
    ${Array.from({ length: count }, () => `<div class="html-repeat-row">${text}</div>`).join("")}
  </div>
`;

const takeLabelHtmlMap: Record<string, string> = {
  [HTML_LABEL_TAKE_FEVER_6HR]: repeatLabelHtml("38도 이상 열날 때 6시간 간격으로 복용", 5),
  [HTML_LABEL_TAKE_SLEEP]: repeatLabelHtml("수면장애 시 복용하세요", 5),
  [HTML_LABEL_TAKE_NAUSEA]: repeatLabelHtml("속이 울렁거릴 때 복용하세요", 5),
  [HTML_LABEL_TAKE_CHEST_PAIN]: repeatLabelHtml("가슴 통증 시 혀밑에 1알 넣으세요", 5),
  [HTML_LABEL_TAKE_HIVES]: repeatLabelHtml("두드러기 발생 시 복용하세요", 5),
  [HTML_LABEL_TAKE_ITCHING]: repeatLabelHtml("가려움 발생 시 복용하세요", 5),
  [HTML_LABEL_TAKE_DIARRHEA]: repeatLabelHtml("(지사제) 설사 시 복용하세요", 5),
  [HTML_LABEL_TAKE_FEVER]: repeatLabelHtml("발열 시 복용하세요", 5),
  [HTML_LABEL_TAKE_PAIN]: repeatLabelHtml("통증 심할 때 복용하세요", 5),
  [HTML_LABEL_TAKE_PAIN_FEVER]: repeatLabelHtml("통증, 발열 시에만 복용하세요<br>6시간 간격 하루 4회까지", 3, "two-line"),
  [HTML_LABEL_TAKE_WATERY_DIARRHEA]: repeatLabelHtml("물설사 하루 3~4회 이상 발생 시 복용", 5),
  [HTML_LABEL_TAKE_HEADACHE]: repeatLabelHtml("두통 있을 때 복용하세요", 5),
  [STOP_LABELS.looseStool]: repeatLabelHtml("묽은변 호전되면 복용 중단", 5),
  [STOP_LABELS.diarrhea]: repeatLabelHtml("설사 시 복용 중단", 5),
  [STOP_LABELS.drowsy]: repeatLabelHtml("졸림 심하면 중단하세요", 5),
  [STOP_LABELS.improve]: repeatLabelHtml("증상 호전 시 중단 가능", 5),
  [STOP_LABELS.tremor]: repeatLabelHtml("떨림 시 중단하세요", 5),
  [STOP_LABELS.fussy]: repeatLabelHtml("보챔 심할 시 중단하세요", 5),
};

const takeLabelTextMap: Record<string, { text: string; count: number; className?: string }> = {
  [HTML_LABEL_TAKE_FEVER_6HR]: { text: "38도 이상 열날 때 6시간 간격으로 복용", count: 5 },
  [HTML_LABEL_TAKE_SLEEP]: { text: "수면장애 시 복용하세요", count: 5 },
  [HTML_LABEL_TAKE_NAUSEA]: { text: "속이 울렁거릴 때 복용하세요", count: 5 },
  [HTML_LABEL_TAKE_CHEST_PAIN]: { text: "가슴 통증 시 혀밑에 1알 넣으세요", count: 5 },
  [HTML_LABEL_TAKE_HIVES]: { text: "두드러기 발생 시 복용하세요", count: 5 },
  [HTML_LABEL_TAKE_ITCHING]: { text: "가려움 발생 시 복용하세요", count: 5 },
  [HTML_LABEL_TAKE_DIARRHEA]: { text: "(지사제) 설사 시 복용하세요", count: 5 },
  [HTML_LABEL_TAKE_FEVER]: { text: "발열 시 복용하세요", count: 5 },
  [HTML_LABEL_TAKE_PAIN]: { text: "통증 심할 때 복용하세요", count: 5 },
  [HTML_LABEL_TAKE_PAIN_FEVER]: { text: `통증, 발열 시에만 복용하세요
6시간 간격 하루 4회까지`, count: 3, className: "two-line" },
  [HTML_LABEL_TAKE_WATERY_DIARRHEA]: { text: "물설사 하루 3~4회 이상 발생 시 복용", count: 5 },
  [HTML_LABEL_TAKE_HEADACHE]: { text: "두통 있을 때 복용하세요", count: 5 },
  [STOP_LABELS.looseStool]: { text: "묽은변 호전되면 복용 중단", count: 5 },
  [STOP_LABELS.diarrhea]: { text: "설사 시 복용 중단", count: 5 },
  [STOP_LABELS.drowsy]: { text: "졸림 심하면 중단하세요", count: 5 },
  [STOP_LABELS.improve]: { text: "증상 호전 시 중단 가능", count: 5 },
  [STOP_LABELS.tremor]: { text: "떨림 시 중단하세요", count: 5 },
  [STOP_LABELS.fussy]: { text: "보챔 심할 시 중단하세요", count: 5 },
};

const getAutoFontSize = (text: string) => {
  const length = text.replace(/\n/g, "").length;
  if (length >= 22) return "4.2mm";
  if (length >= 18) return "4.5mm";
  return "4.9mm";
};

const RepeatLabel = ({ text, count, className = "" }: { text: string; count: number; className?: string }) => (
  <div className={`html-label html-repeat-label ${className}`} style={{ ["--repeat-count" as string]: count } as React.CSSProperties}>
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="html-repeat-row" style={{ fontSize: getAutoFontSize(text) }}>{text}</div>
    ))}
  </div>
);

const PrepLabel = ({ title }: { title: string }) => (
  <div className="html-label html-prep-label">
    <div className="html-prep-title">〈{title}〉</div>
    <div className="html-prep-line"><span className="prep-num">①</span><span className="prep-text">먼저 조제된 시럽부터 복용하세요.</span></div>
    <div className="html-prep-line"><span className="prep-num">②</span><span className="prep-text">시럽병 표시선의 2/3까지 물을 부어<br />잘 섞으세요.</span></div>
    <div className="html-prep-line"><span className="prep-num">③</span><span className="prep-text">표시선(50mL)까지 물을 채우고,<br />잘 흔들어 복용하세요.</span></div>
    <div className="html-prep-line"><span className="prep-num">④</span><span className="prep-text">조제된 시럽은 〈냉장보관〉 하세요.</span></div>
  </div>
);

const PictogramLabel = ({ src }: { src: string }) => {
  const label = getPresetLabel(src);
  const markup = getPictogramIconMarkup(src);

  if (isThreeRowPictogram(src)) {
    return (
      <div className="html-label html-repeat-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={`html-row ${src === PICTOGRAM_LABELS.inhaler ? "inhaler-row" : ""}`}>
            <div className={`html-icon ${src === PICTOGRAM_LABELS.antidiarrheal ? "antidiarrheal-icon" : src === PICTOGRAM_LABELS.constipation ? "constipation-icon" : src === PICTOGRAM_LABELS.inhaler ? "inhaler-icon" : ""}`}><SvgIcon markup={markup} /></div>
            <div className="html-text">
              <div className="title">
                {label === "흡입하는 약 (먹지 마세요)" ? <>흡입하는 약<br />(먹지 마세요)</> : label}
              </div>
              {(label.includes("콧물") || label.includes("가려움")) && <div className="sub">졸림 심하면 중단</div>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="html-label html-pictogram-grid">
      {Array.from({ length: 10 }, (_, index) => (
        <div key={index} className={`html-pictogram-cell ${src === PICTOGRAM_LABELS.coughPhlegm ? "cough-label" : src === PICTOGRAM_LABELS.stuffyNose ? "stuffy-nose-label" : src === PICTOGRAM_LABELS.inhaler ? "inhaler-label" : ""}`}>
          {src === PICTOGRAM_LABELS.coughPhlegm ? (
            <div className="cough-inner">
              <div className="html-icon"><SvgIcon markup={markup} /></div>
              <div className="html-text"><div className="title">{label}</div></div>
            </div>
          ) : src === PICTOGRAM_LABELS.stuffyNose ? (
            <div className="stuffy-nose-inner">
              <div className="html-icon stuffy-nose-icon"><SvgIcon markup={markup} /></div>
              <div className="html-text"><div className="title">{label}</div></div>
            </div>
          ) : (
            <>
              <div className={`html-icon ${src === PICTOGRAM_LABELS.antidiarrheal ? "antidiarrheal-icon" : src === PICTOGRAM_LABELS.constipation ? "constipation-icon" : src === PICTOGRAM_LABELS.inhaler ? "inhaler-icon" : ""}`}><SvgIcon markup={markup} /></div>
              <div className="html-text"><div className="title">{label}</div></div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

const renderHtmlLabel = (src: string): React.ReactNode => {
  if (src === HTML_LABEL_VENTOLIN) {
    return <div className="html-label html-label-ventolin"><div className="html-label-title">벤토린 흡입액</div><div className="html-label-line">벤토린 (　　　) + 풀미칸 (　　　)</div><div className="html-label-line">섞어서 하루 (　　　)회 흡입 치료</div><div className="html-label-warning">*경구로 섭취하지 마세요</div></div>;
  }
  if (src === HTML_LABEL_FEVER_DETAIL) {
    return <div dangerouslySetInnerHTML={{ __html: feverDetailLabelHtml }} />;
  }
  if (src === HTML_LABEL_AUGMENTIN_DUO) return <PrepLabel title="오구멘틴듀오 건조 시럽" />;
  if (src === HTML_LABEL_AMOCRANEO) return <PrepLabel title="아모크라네오 건조 시럽" />;
  if (src.startsWith("html:pictogram-")) return <PictogramLabel src={src} />;
  if (takeLabelTextMap[src]) {
    const item = takeLabelTextMap[src];
    return <RepeatLabel text={item.text} count={item.count} className={item.className} />;
  }
  return null;
};

const getHtmlLabelMarkup = (src: string): string => {
  if (src === HTML_LABEL_VENTOLIN) return ventolinLabelHtml;
  if (src === HTML_LABEL_FEVER_DETAIL) return feverDetailLabelHtml;
  if (src === HTML_LABEL_AUGMENTIN_DUO) return augmentinDuoLabelHtml;
  if (src === HTML_LABEL_AMOCRANEO) return amocraneoLabelHtml;
  if (src.startsWith("html:pictogram-")) return getPictogramMarkup(src);
  if (takeLabelHtmlMap[src]) return takeLabelHtmlMap[src];
  return "";
};

const toNum = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const round = (value: number, digits = 2): number => Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
const clampPositive = (value: string, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const clampNonNegative = (value: string, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const getFractionScore = (tabs: number): number => {
  const fraction = ((tabs % 1) + 1) % 1;
  const quarterTargets = [0, 0.25, 0.5, 0.75];
  return Math.min(...quarterTargets.map((target) => Math.min(Math.abs(fraction - target), 1 - Math.abs(fraction - target))));
};
const getPrecisionLabel = (totalTabs: number, score: number): string => {
  const fraction = ((totalTabs % 1) + 1) % 1;
  const integerDistance = Math.min(Math.abs(fraction), Math.abs(1 - fraction));
  if (score === 0) {
    if (integerDistance < 1e-9) return "정확히 정수";
    if (Number.isInteger(totalTabs * 2)) return "정확히 0.5T";
    return "정확히 0.25T";
  }
  if (integerDistance <= 0.02) return "정수 근접";
  if (Math.abs(fraction - 0.5) <= 0.02) return "0.5T 근접";
  return "0.25T 근접";
};
const getPracticalPenalty = (packs: number, totalTabs: number): number => {
  const packPenalty = packs <= 4 ? 0 : packs <= 8 ? 5 : packs <= 12 ? 15 : 40;
  const totalTabsPenalty = totalTabs <= 2 ? 0 : totalTabs <= 4 ? 5 : 15;
  return packPenalty + totalTabsPenalty;
};
const buildRecommendationReason = ({ precisionLabel, packs, kind }: { precisionLabel: string; packs: number; kind?: "practical" | "accuracy" }): string => {
  if (kind === "accuracy") return "오차 최소값 기준";
  if (packs <= 4) return `${precisionLabel} + 포수 적음`;
  if (packs <= 8) return `${precisionLabel} + 실무 적정 포수`;
  return `${precisionLabel} + 참고용 후보`;
};
const calculateResult = (strength: number, dose: number, packs: number): CalcResult | null => {
  if (strength <= 0 || dose <= 0 || packs <= 0) return null;
  const totalTabs = (dose * packs) / strength;
  return { totalTabs: round(totalTabs), perPack: round((totalTabs * strength) / packs), ratio: round(dose / strength) };
};
const calculateTModeResult = (doseT: number, packs: number, strengthMg: number): CalcResult | null => {
  if (doseT <= 0 || packs <= 0) return null;
  return { totalTabs: round(doseT * packs), perPack: round(strengthMg > 0 ? doseT * strengthMg : 0), ratio: round(doseT) };
};
const buildMgRecommendations = (strength: number, dose: number): Recommendation[] => {
  if (strength <= 0 || dose <= 0) return [];
  const list: Recommendation[] = [];
  for (let packs = 1; packs <= 30; packs += 1) {
    const totalTabs = (dose * packs) / strength;
    const accuracy = getFractionScore(totalTabs);
    const precisionLabel = getPrecisionLabel(totalTabs, accuracy);
    list.push({ packs, tabs: round(totalTabs), score: accuracy, accuracy, precisionLabel, reason: buildRecommendationReason({ precisionLabel, packs, kind: "practical" }), kind: "practical" });
  }
  return list.sort((a, b) => a.accuracy - b.accuracy || a.packs - b.packs).slice(0, 4);
};
const buildTRecommendations = (doseT: number, practicalPackLimit: number): Recommendation[] => {
  if (doseT <= 0) return [];
  const candidates: Recommendation[] = [];
  for (let packs = 1; packs <= 30; packs += 1) {
    const totalTabs = doseT * packs;
    const accuracy = getFractionScore(totalTabs);
    const precisionLabel = getPrecisionLabel(totalTabs, accuracy);
    candidates.push({ packs, tabs: round(totalTabs), score: accuracy * 100 + getPracticalPenalty(packs, totalTabs), accuracy, precisionLabel, reason: buildRecommendationReason({ precisionLabel, packs, kind: "practical" }), kind: "practical" });
  }
  const withinLimit = candidates.filter((item) => item.packs <= practicalPackLimit);
  const exactWithinLimit = withinLimit.filter((item) => item.accuracy === 0).sort((a, b) => a.packs - b.packs || a.tabs - b.tabs);
  const nearWithinLimit = withinLimit.filter((item) => item.accuracy > 0 && item.accuracy <= 0.02).sort((a, b) => a.packs - b.packs || a.accuracy - b.accuracy || a.tabs - b.tabs);
  const practicalRest = [...candidates].sort((a, b) => {
    const accuracyGap = Math.abs(a.accuracy - b.accuracy);
    if (a.packs <= practicalPackLimit && b.packs <= practicalPackLimit && accuracyGap >= 0.015) return a.accuracy - b.accuracy || a.packs - b.packs;
    return a.score - b.score || a.accuracy - b.accuracy || a.packs - b.packs;
  });
  const practicalTop3: Recommendation[] = [];
  const seen = new Set<string>();
  const addUnique = (item: Recommendation) => {
    const key = `${item.packs}-${item.tabs}`;
    if (!seen.has(key) && practicalTop3.length < 3) { seen.add(key); practicalTop3.push(item); }
  };
  exactWithinLimit.forEach(addUnique);
  nearWithinLimit.forEach(addUnique);
  practicalRest.forEach(addUnique);
  const accuracyBest = [...candidates].sort((a, b) => a.accuracy - b.accuracy || a.packs - b.packs)[0];
  if (accuracyBest && !practicalTop3.some((item) => item.packs === accuracyBest.packs && item.tabs === accuracyBest.tabs)) {
    practicalTop3.push({ ...accuracyBest, kind: "accuracy", precisionLabel: "정확도 우선", reason: buildRecommendationReason({ precisionLabel: "정확도 우선", packs: accuracyBest.packs, kind: "accuracy" }) });
  }
  return practicalTop3;
};

const loadSavedLabels = (): SavedLabel[] => {
  if (typeof window === "undefined") return [];
  try { const raw = window.localStorage.getItem(LABEL_STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
};
const saveSavedLabels = (labels: SavedLabel[]): void => {
  if (typeof window !== "undefined") window.localStorage.setItem(LABEL_STORAGE_KEY, JSON.stringify(labels));
};

const runSelfTests = (): void => {
  console.assert(calculateResult(75, 22, 4)?.totalTabs === 1.17, "mg totalTabs test");
  console.assert(calculateResult(100, 25, 2)?.totalTabs === 0.5, "mg half tab test");
  console.assert(buildMgRecommendations(100, 25).length === 4, "mg recommendations length test");
  const t033 = buildTRecommendations(0.33, 15);
  console.assert(t033.length >= 3, "T recommendations length test");
  console.assert(t033[0]?.packs === 3, "0.33T should prefer 3 packs near 1T");
  console.assert(clampNonNegative("0", 4) === 0, "0 padding should be valid");
  console.assert(round((261.1 / 470) * 10, 2) === 5.56, "syrup grams test");
  console.assert(getHtmlLabelMarkup(PICTOGRAM_LABELS.phlegm).includes("html-pictogram-grid"), "pictogram markup test");
  console.assert(getHtmlLabelMarkup(STOP_LABELS.diarrhea).includes("설사 시 복용 중단"), "stop label markup test");
};
runSelfTests();

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={["relative cursor-pointer rounded-full px-8 py-3 text-base font-semibold transition-all duration-200 ease-out select-none border border-white/60 active:translate-y-[2px] active:scale-[0.985]", active ? "bg-[#7A816C] text-white shadow-[0_14px_24px_rgba(116,106,88,0.22),0_3px_4px_rgba(255,255,255,0.28)_inset,0_-10px_16px_rgba(122,129,108,0.22)_inset]" : "bg-[#f7f2ec] text-[#6b6156] shadow-[0_12px_20px_rgba(116,106,88,0.15),0_2px_3px_rgba(255,255,255,0.85)_inset,0_-8px_14px_rgba(221,212,201,0.42)_inset] hover:-translate-y-[1px]"].join(" ")}>{label}</button>;
}
function PebbleButton({ children, onClick, variant = "light", className = "" }: { children: React.ReactNode; onClick?: () => void; variant?: "light" | "sage"; className?: string }) {
  return <button type="button" onClick={onClick} className={["relative cursor-pointer rounded-full px-6 py-3 text-base font-semibold transition-all duration-200 ease-out border border-white/60 active:translate-y-[2px] active:scale-[0.985]", variant === "sage" ? "bg-[#7A816C] text-white shadow-[0_14px_24px_rgba(116,106,88,0.22),0_3px_4px_rgba(255,255,255,0.28)_inset,0_-10px_16px_rgba(122,129,108,0.22)_inset]" : "bg-[#f7f2ec] text-[#6b6156] shadow-[0_12px_20px_rgba(116,106,88,0.15),0_2px_3px_rgba(255,255,255,0.85)_inset,0_-8px_14px_rgba(221,212,201,0.42)_inset]", className].join(" ")}>{children}</button>;
}
function SectionCard({ title, children, description }: { title: string; children: React.ReactNode; description?: string }) {
  return <Card className="rounded-3xl border border-[#e5dccf] bg-[#f8f4ed] shadow-[0_10px_30px_rgba(99,88,70,0.08)]"><CardHeader><CardTitle className="text-2xl text-[#3e372f]">{title}</CardTitle>{description && <div className="text-sm text-[#8a8175]">{description}</div>}</CardHeader><CardContent>{children}</CardContent></Card>;
}
function ResultBox({ label, value }: { label: string; value: string }) {
  return <div className="flex min-h-[52px] flex-col justify-center"><div className="text-sm text-[#6e665b]">{label}</div><div className="text-xl font-semibold leading-tight text-[#3f372f]">{value}</div></div>;
}

export default function App() {
  const [tab, setTab] = useState<TabKey>("split");
  const [splitMode, setSplitMode] = useState<SplitMode>("mg");
  const [strength, setStrength] = useState("");
  const [dose, setDose] = useState("");
  const [packs, setPacks] = useState("");
  const [practicalPackLimit, setPracticalPackLimit] = useState("15");
  const [selectedSyrup, setSelectedSyrup] = useState(SORTED_SYRUP_DRUGS[0]?.name ?? "");
  const [syrupMl, setSyrupMl] = useState("");
  const [labelMode, setLabelMode] = useState<LabelMode>("text");
  const [templateName, setTemplateName] = useState("");
  const [labelContent, setLabelContent] = useState("");
  const [fontSize, setFontSize] = useState("30");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [isBold, setIsBold] = useState(true);
  const [isUnderline, setIsUnderline] = useState(false);
  const [lineHeight, setLineHeight] = useState("1.6");
  const [labelWidthMm, setLabelWidthMm] = useState("90");
  const [labelHeightMm, setLabelHeightMm] = useState("50");
  const [labelPaddingMm, setLabelPaddingMm] = useState("0");
  const [labelCopies, setLabelCopies] = useState("1");
  const [savedLabels, setSavedLabels] = useState<SavedLabel[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedLabelImages, setSelectedLabelImages] = useState<string[]>([]);
  const [favoriteImages, setFavoriteImages] = useState<string[]>([]);
  const [takeImageSelection, setTakeImageSelection] = useState("");
  const [stopImageSelection, setStopImageSelection] = useState("");
  const [pictogramImageSelection, setPictogramImageSelection] = useState("");
  const [prepImageSelection, setPrepImageSelection] = useState("");
  const labelTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resetMgInputs = () => {
    setStrength("");
    setDose("");
    setPacks("");
  };

  const resetTInputs = () => {
    setStrength("");
    setDose("");
    setPacks("");
    setPracticalPackLimit("15");
  };

  useEffect(() => {
    setSavedLabels(loadSavedLabels());
    if (typeof window !== "undefined") {
      try { const fav = window.localStorage.getItem(FAVORITE_STORAGE_KEY); if (fav) setFavoriteImages(JSON.parse(fav)); } catch { setFavoriteImages([]); }
    }
  }, []);

  const s = toNum(strength);
  const d = toNum(dose);
  const p = toNum(packs);
  const practicalLimit = practicalPackLimit === "none" ? 30 : clampPositive(practicalPackLimit, 15);
  const result = useMemo(() => (splitMode === "mg" ? calculateResult(s, d, p) : calculateTModeResult(d, p, s)), [splitMode, s, d, p]);
  const recs = useMemo(() => (splitMode === "mg" ? buildMgRecommendations(s, d) : buildTRecommendations(d, practicalLimit)), [splitMode, s, d, practicalLimit]);
  useEffect(() => { if (recs.length > 0) setPacks(String(recs[0].packs)); }, [recs]);

  const selectedDrug = SYRUP_DRUGS.find((drug) => drug.name === selectedSyrup);
  const syrupAmount = selectedDrug ? round(selectedDrug.gramsPerMl * toNum(syrupMl), 2) : 0;
  const syrupInfo = SYRUP_INFO[selectedSyrup];
  const printConfig = { width: clampPositive(labelWidthMm, 90), height: clampPositive(labelHeightMm, 50), padding: clampNonNegative(labelPaddingMm, 0), copies: Math.max(1, Math.floor(clampPositive(labelCopies, 1))) };
  const imagePresetsByCategory = useMemo(() => ({ take: labelPresetsByCategory("take"), stop: labelPresetsByCategory("stop"), pictogram: labelPresetsByCategory("pictogram"), prep: labelPresetsByCategory("prep") }), []);
  const printableHtml = useMemo(() => labelContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />"), [labelContent]);

  const addImageLabel = (src: string) => { if (!src) return; setSelectedLabelImages((prev) => [...prev, src]); setTakeImageSelection(""); setStopImageSelection(""); setPictogramImageSelection(""); setPrepImageSelection(""); };
  const toggleFavorite = (src: string) => {
    setFavoriteImages((prev) => { const next = prev.includes(src) ? prev.filter((item) => item !== src) : [src, ...prev]; if (typeof window !== "undefined") window.localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(next)); return next; });
  };
  const moveSelectedImage = (index: number, direction: "up" | "down") => {
    setSelectedLabelImages((prev) => { const next = [...prev]; const target = direction === "up" ? index - 1 : index + 1; if (target < 0 || target >= next.length) return prev; [next[index], next[target]] = [next[target], next[index]]; return next; });
  };
  const removeSelectedImageAt = (index: number) => setSelectedLabelImages((prev) => prev.filter((_, i) => i !== index));
  const clearSelectedImages = () => setSelectedLabelImages([]);
  const insertSymbol = (symbol: string) => {
    const textarea = labelTextareaRef.current;
    if (!textarea) { setLabelContent((prev) => `${prev}${symbol}`); return; }
    const start = textarea.selectionStart ?? labelContent.length;
    const end = textarea.selectionEnd ?? labelContent.length;
    setLabelContent(`${labelContent.slice(0, start)}${symbol}${labelContent.slice(end)}`);
    requestAnimationFrame(() => { textarea.focus(); textarea.selectionStart = start + symbol.length; textarea.selectionEnd = start + symbol.length; });
  };
  const handleSaveLabel = () => { const name = templateName.trim() || "이름 없는 라벨"; const next: SavedLabel[] = [{ id: `${Date.now()}`, name, content: labelContent, createdAt: new Date().toISOString() }, ...savedLabels]; setSavedLabels(next); saveSavedLabels(next); };
  const handleLoadLabel = (item: SavedLabel) => { setTemplateName(item.name); setLabelContent(item.content); };
  const handleDeleteLabel = (id: string) => { const next = savedLabels.filter((item) => item.id !== id); setSavedLabels(next); saveSavedLabels(next); };
  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    const textLabelHtml = `<div class="label-sheet"><div class="label-body">${printableHtml || "라벨 내용 미리보기"}</div></div>`;
    const imageLabelHtml = selectedLabelImages.map((src) => Array.from({ length: printConfig.copies }, () => isHtmlLabel(src) ? `<div class="label-image-wrap">${getHtmlLabelMarkup(src)}</div>` : `<div class="label-image-wrap"><img src="${versionedSrc(src)}" alt="label" /></div>`).join("")).join("");
    const outputHtml = labelMode === "image" ? imageLabelHtml : Array.from({ length: printConfig.copies }, () => textLabelHtml).join("");
    printWindow.document.write(`<!doctype html><html lang="ko"><head><meta charset="utf-8" /><title>라벨 출력</title><style>@page { size: ${printConfig.width}mm ${printConfig.height}mm; margin: 0; } html, body { margin: 0; padding: 0; background: white; font-family: Arial, "Malgun Gothic", sans-serif; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .label-sheet, .label-image-wrap { box-sizing: border-box; width: ${printConfig.width}mm; height: ${printConfig.height}mm; background: white; overflow: hidden; page-break-after: always; } .label-sheet { padding: ${printConfig.padding}mm; } .label-body { white-space: pre-line; font-size: ${fontSize}px; text-align: ${textAlign}; font-weight: ${isBold ? "700" : "400"}; text-decoration: ${isUnderline ? "underline" : "none"}; line-height: ${lineHeight}; } .label-image-wrap img { width: 100%; height: 100%; object-fit: contain; image-rendering: auto; } ${HTML_LABEL_STYLE}</style></head><body>${outputHtml}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const symbolButtons = ["☆", "★", "○", "-", "·", "＊", "※", "→", "▶", "경고"];

  return (
    <div className="min-h-screen bg-[#e9e0d2] px-6 py-10 text-[#302b26]">
      <style>{`${HTML_LABEL_STYLE} html { overflow-y: scroll; scrollbar-gutter: stable; } button:not(:disabled), select, input[type="button"], input[type="submit"], input[type="reset"] { cursor: pointer; } button:disabled { cursor: not-allowed; }`}</style>
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3"><div className="text-xs tracking-[0.32em] text-[#8a8175]">KNUH PHARMACY TOOLKIT</div><div className="flex items-end gap-3"><h1 className="border-l-4 border-[#7A816C] pl-3 text-3xl font-bold text-[#302b26]">약제과 업무지원 도구</h1><span className="text-sm text-[#8a8175]">· 산제조제</span></div><div className="text-xs tracking-[0.18em] text-[#8a8175]">pharmacy utility series · YJ · v1.0</div></header>
        <nav className="flex flex-wrap gap-4"><TabButton active={tab === "split"} label="분할조제 계산" onClick={() => setTab("split")} /><TabButton active={tab === "syrup"} label="건조시럽 조제" onClick={() => setTab("syrup")} /><TabButton active={tab === "label"} label="라벨 제작" onClick={() => setTab("label")} /></nav>

        {tab === "split" && <div className="space-y-6"><SectionCard title="분할조제 계산" description="mg 또는 T 단위 처방 기준으로 몇 정을 몇 포로 나눌지 계산"><div className="space-y-5"><div className="flex items-center justify-between gap-3">
  <div className="flex flex-wrap items-center gap-3">
    <PebbleButton onClick={() => { setSplitMode("mg"); resetMgInputs(); }} variant={splitMode === "mg" ? "sage" : "light"}>mg 기준</PebbleButton>
    <PebbleButton onClick={() => { setSplitMode("t"); resetTInputs(); }} variant={splitMode === "t" ? "sage" : "light"}>T 기준</PebbleButton>
  </div>
  <button
    type="button"
    onClick={splitMode === "mg" ? resetMgInputs : resetTInputs}
    className="text-sm font-semibold text-[#6b6156] underline underline-offset-2 hover:text-[#4f463e]"
  >
    초기화
  </button>
</div><div className="grid gap-4 md:grid-cols-4">{splitMode === "mg" && <div><Label>약 1정 함량</Label><Input value={strength} onChange={(e) => setStrength(e.target.value)} placeholder="mg/tab" /></div>}<div><Label>{splitMode === "mg" ? "처방 1회 용량" : "처방 1회 용량(T)"}</Label><Input value={dose} onChange={(e) => setDose(e.target.value)} placeholder={splitMode === "mg" ? "mg" : "T"} /></div><div><Label>나눌 포 수</Label><Input value={packs} onChange={(e) => setPacks(e.target.value)} placeholder="포" /></div>{splitMode === "t" && <div><Label>실무추천 포수 제한</Label><select value={practicalPackLimit} onChange={(e) => setPracticalPackLimit(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="10">10포 이하</option><option value="12">12포 이하</option><option value="15">15포 이하</option><option value="none">제한 없음</option></select></div>}</div><div className="rounded-xl bg-[#ede6da] p-3 text-sm text-[#6f665a]">{splitMode === "mg" ? "계산식: (처방용량 × 포수) ÷ 1정 함량" : "계산식: 처방 T × 포수 = 필요한 총 정수"}</div>{splitMode === "t" && <div className="rounded-xl bg-[#e9f0e6] p-3 text-sm text-[#4b5a3f]">T 기준 추천은 1~3순위는 실무추천, 마지막 항목은 정확도 우선값으로 표시됩니다.</div>}</div></SectionCard><Card className="rounded-3xl border border-[#e5dccf] bg-[#f8f4ed]"><CardContent className="grid min-h-[96px] items-center gap-6 p-6 md:grid-cols-3"><ResultBox label="필요한 총 정수" value={result ? `${result.totalTabs} T` : "-"} />{splitMode === "mg" && <ResultBox label="1포당 실제 함량" value={result ? `${result.perPack} mg` : "-"} />}<ResultBox label="정수 비율" value={result ? `${result.ratio} T` : "-"} /></CardContent></Card><Card className="rounded-3xl border border-[#e5dccf] bg-[#f8f4ed]"><CardHeader><CardTitle className="text-xl text-[#3e372f]">추천 포 수</CardTitle></CardHeader><CardContent><div className="grid gap-3 md:grid-cols-4">{recs.length > 0 ? recs.map((r, i) => <button key={`${r.packs}-${r.tabs}-${i}`} type="button" onClick={() => setPacks(String(r.packs))} className={`rounded-3xl border px-4 py-4 text-center ${i === 0 ? "bg-[#7A816C] text-white" : "bg-[#f7f2ec] text-[#6b6156]"}`}><div className="text-lg font-bold">{i === 0 ? "⭐ " : ""}{r.packs}포 ({r.tabs}T)</div><div className={`mt-1 text-xs ${i === 0 ? "text-white/85" : "text-[#8a8175]"}`}>{r.precisionLabel}{r.kind === "accuracy" && <span className="ml-1">(정확도 우선)</span>}</div><div className={`mt-1 text-[11px] ${i === 0 ? "text-white/75" : "text-[#9a9083]"}`}>{r.reason}</div></button>) : <div className="text-sm text-[#8a8175]">값을 입력하면 추천 포수가 표시됩니다.</div>}</div></CardContent></Card></div>}

        {tab === "syrup" && <div className="space-y-6"><SectionCard title="건조시럽 조제"><div className="space-y-5"><div className="grid gap-4 md:grid-cols-2"><div><Label>약품 선택</Label><select value={selectedSyrup} onChange={(e) => setSelectedSyrup(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">{SORTED_SYRUP_DRUGS.map((drug) => <option key={drug.name} value={drug.name}>{drug.name}</option>)}</select></div><div><Label>제조할 최종 용량</Label><Input value={syrupMl} onChange={(e) => setSyrupMl(e.target.value)} placeholder="mL" /></div></div>{syrupInfo && <div className={`rounded-xl p-4 text-base font-semibold ${syrupInfo.storage === "냉장" ? "bg-[#e3ebe6] text-[#4b5a3f]" : "bg-[#efe3e6] text-[#6a4b4f]"}`}>{syrupInfo.storage === "냉장" ? "❄️ " : "🏠 "}조제 후 {syrupInfo.storage} 보관 / 유효기간 {syrupInfo.duration}</div>}<div className="rounded-xl bg-[#ede6da] p-3 text-sm text-[#6f665a]">계산식: 약품별 g/mL × 제조할 mL = 필요한 분말량(g)</div></div></SectionCard><Card className="rounded-3xl border border-[#e5dccf] bg-[#f8f4ed]"><CardContent className="p-6"><ResultBox label="필요한 분말량" value={syrupAmount > 0 ? `${syrupAmount} g` : "-"} /></CardContent></Card></div>}

        {tab === "label" && <div className="space-y-6"><SectionCard title="라벨 제작"><div className="mb-4 space-y-4"><div className="flex flex-wrap gap-3"><PebbleButton onClick={() => setLabelMode("text")} variant={labelMode === "text" ? "sage" : "light"}>텍스트 라벨</PebbleButton><PebbleButton onClick={() => setLabelMode("image")} variant={labelMode === "image" ? "sage" : "light"}>프리셋 라벨</PebbleButton></div>{labelMode === "image" && <div className="space-y-4">{favoriteImages.length > 0 && <div className="rounded-2xl border border-[#e5dccf] bg-white p-4"><div className="mb-3 flex items-center justify-between"><div className="text-sm font-semibold text-[#6e665b]">즐겨찾기</div><div className="text-xs text-[#8a8175]">★ 버튼으로 추가/해제</div></div><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">{favoriteImages.map((src) => LABEL_IMAGE_PRESETS.find((item) => item.src === src)).filter((item): item is LabelImagePreset => Boolean(item)).map((item) => <button key={`favorite-${item.key}`} type="button" onClick={() => addImageLabel(item.src)} className="flex items-center justify-between rounded-xl border border-[#e5dccf] bg-[#f8f4ed] px-3 py-2 text-left text-sm text-[#5f574d] hover:bg-[#f1eadf]"><span className="truncate pr-2">{item.label}</span><span className="text-[#b08b2e]">★</span></button>)}</div></div>}<div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">{([["복용 라벨", takeImageSelection, setTakeImageSelection, imagePresetsByCategory.take, "복용 라벨 선택"], ["복용 중단 라벨", stopImageSelection, setStopImageSelection, imagePresetsByCategory.stop, "복용 중단 라벨 선택"], ["약종류 라벨", pictogramImageSelection, setPictogramImageSelection, imagePresetsByCategory.pictogram, "약종류 라벨 선택"], ["조제방법 라벨", prepImageSelection, setPrepImageSelection, imagePresetsByCategory.prep, "조제방법 라벨 선택"]] as const).map(([title, value, setter, items, placeholder]) => <div key={title}><Label>{title}</Label><select value={value} onChange={(e) => { setter(e.target.value); addImageLabel(e.target.value); }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">{placeholder}</option>{items.map((item) => <option key={item.key} value={item.src}>{item.label}</option>)}</select></div>)}</div><div className="mt-2 text-xs text-[#8a8175]">라벨을 선택하면 목록에 추가되고, 선택한 순서대로 출력됩니다.</div><div><div className="mb-2 flex items-center justify-between"><Label>선택된 프리셋 라벨 목록</Label>{selectedLabelImages.length > 0 && <button type="button" onClick={clearSelectedImages} className="text-sm text-[#8a8175] underline underline-offset-2">전체 비우기</button>}</div><div className="rounded-2xl border border-input bg-background p-4">{selectedLabelImages.length > 0 ? <div className="grid gap-3 md:grid-cols-2">{selectedLabelImages.map((src, index) => <div key={`${src}-${index}`} className="rounded-xl border border-[#e5dccf] bg-white p-3"><div className="relative">{isHtmlLabel(src) ? <div className="mx-auto overflow-hidden rounded bg-white" style={{ width: "100%", maxWidth: "360px", aspectRatio: `${printConfig.width} / ${printConfig.height}` }}>{renderHtmlLabel(src)}</div> : <img src={versionedSrc(src)} alt={`선택된 라벨 ${index + 1}`} className="mx-auto max-h-[180px] w-full object-contain" />}<button type="button" onClick={() => toggleFavorite(src)} className="absolute top-1 right-1 rounded bg-white/80 px-1 text-xs">★</button></div><div className="mt-2 flex items-center justify-between gap-2 text-sm text-[#6e665b]"><span>{index + 1}번 라벨</span><div className="flex items-center gap-2"><button type="button" onClick={() => moveSelectedImage(index, "up")} disabled={index === 0} className="text-[#8a8175] underline underline-offset-2 disabled:no-underline disabled:opacity-40">↑</button><button type="button" onClick={() => moveSelectedImage(index, "down")} disabled={index === selectedLabelImages.length - 1} className="text-[#8a8175] underline underline-offset-2 disabled:no-underline disabled:opacity-40">↓</button><button type="button" onClick={() => removeSelectedImageAt(index)} className="text-[#8a8175] underline underline-offset-2">제거</button></div></div></div>)}</div> : <div className="flex min-h-[220px] items-center justify-center text-sm text-[#8a8175]">드롭박스에서 프리셋 라벨을 선택하세요</div>}</div></div></div>}{labelMode === "text" && <div className="space-y-4"><div><Label>템플릿명</Label><Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="예: 아목시실린 기본 라벨" /></div><div><Label>라벨 내용</Label><div className="mt-2 mb-3 flex items-center gap-2 overflow-x-auto whitespace-nowrap"><select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="rounded border px-2 py-1 text-sm"><option value="24">작게</option><option value="30">보통</option><option value="36">크게</option><option value="42">매우 크게</option></select><select value={textAlign} onChange={(e) => setTextAlign(e.target.value as "left" | "center" | "right")} className="rounded border px-2 py-1 text-sm"><option value="left">좌측</option><option value="center">가운데</option><option value="right">우측</option></select><button type="button" onClick={() => setIsBold((v) => !v)} className={`rounded border px-3 py-1 text-sm ${isBold ? "bg-[#7A816C] text-white" : "bg-white"}`}>B</button><button type="button" onClick={() => setIsUnderline((v) => !v)} className={`rounded border px-3 py-1 text-sm ${isUnderline ? "bg-[#7A816C] text-white" : "bg-white"}`}>U</button><select value={lineHeight} onChange={(e) => setLineHeight(e.target.value)} className="rounded border px-2 py-1 text-sm"><option value="1.4">좁게</option><option value="1.6">기본</option><option value="1.8">넓게</option></select>{symbolButtons.map((symbol) => <button key={symbol} type="button" onClick={() => insertSymbol(symbol)} className="h-8 shrink-0 rounded border bg-white px-2.5 text-sm hover:bg-[#f3ede3]">{symbol}</button>)}<button type="button" onClick={() => setLabelContent("")} className="ml-auto h-8 shrink-0 rounded border bg-white px-3 text-sm text-[#6b6156] hover:bg-[#f3ede3]">초기화</button></div><textarea ref={labelTextareaRef} value={labelContent} onChange={(e) => setLabelContent(e.target.value)} placeholder={`예:\n아목시실린 건조시럽\n1회 1포, 1일 3회\n식후 복용\n냉암소 보관`} className="min-h-[220px] w-full rounded-2xl border border-input bg-background px-3 py-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground" /></div></div>}<div className="grid gap-4 md:grid-cols-4"><div><Label>라벨 가로(mm)</Label><Input value={labelWidthMm} onChange={(e) => setLabelWidthMm(e.target.value)} placeholder="90" /></div><div><Label>라벨 세로(mm)</Label><Input value={labelHeightMm} onChange={(e) => setLabelHeightMm(e.target.value)} placeholder="50" /></div><div><Label>내부 여백(mm)</Label><Input value={labelPaddingMm} onChange={(e) => setLabelPaddingMm(e.target.value)} placeholder="0" /></div><div><Label>{labelMode === "image" ? "세트 반복 수량" : "출력 수량"}</Label><Input value={labelCopies} onChange={(e) => setLabelCopies(e.target.value)} placeholder="1" /></div></div></div><div className="mt-6 mb-2 flex flex-wrap gap-3">{labelMode === "text" && <PebbleButton onClick={handleSaveLabel} variant="sage">라벨 저장</PebbleButton>}<PebbleButton onClick={() => setPreviewOpen(true)} variant="light">라벨 크게 보기</PebbleButton><PebbleButton onClick={handlePrint} variant="light">라벨 출력</PebbleButton></div></SectionCard>{labelMode === "text" ? <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]"><Card className="rounded-3xl border border-[#e5dccf] bg-[#f3ede3]"><CardHeader><CardTitle className="text-xl text-[#3e372f]">저장된 라벨</CardTitle></CardHeader><CardContent className="space-y-3">{savedLabels.length > 0 ? savedLabels.map((item) => <div key={item.id} className="rounded-2xl border border-[#e5dccf] bg-white p-4"><div className="font-semibold text-[#3e372f]">{item.name}</div><div className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-[#6e665b]">{item.content || "내용 없음"}</div><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" onClick={() => handleLoadLabel(item)}>불러오기</Button><Button variant="outline" onClick={() => handleDeleteLabel(item.id)}>삭제</Button></div></div>) : <div className="text-sm text-[#8a8175]">저장된 라벨이 없습니다.</div>}</CardContent></Card><LabelPreviewCard labelMode={labelMode} printConfig={printConfig} labelContent={labelContent} fontSize={fontSize} textAlign={textAlign} isBold={isBold} isUnderline={isUnderline} lineHeight={lineHeight} selectedLabelImages={selectedLabelImages} /></div> : <LabelPreviewCard labelMode={labelMode} printConfig={printConfig} labelContent={labelContent} fontSize={fontSize} textAlign={textAlign} isBold={isBold} isUnderline={isUnderline} lineHeight={lineHeight} selectedLabelImages={selectedLabelImages} />}</div>}
      </div>
      {previewOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-6 py-10"><div className="w-full max-w-4xl rounded-[28px] border border-white/40 bg-[#f3ede3] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.16)]"><div className="mb-5 flex items-center justify-between"><div><div className="text-xl font-semibold text-[#3e372f]">라벨 크게 보기</div><div className="mt-1 text-sm text-[#6e665b]">{printConfig.width} × {printConfig.height} mm · 여백 {printConfig.padding} mm</div></div><PebbleButton onClick={() => setPreviewOpen(false)} variant="light">닫기</PebbleButton></div><div className="overflow-auto rounded-3xl bg-[#ebe4d8] p-8">{labelMode === "image" ? (selectedLabelImages.length > 0 ? <div className="grid gap-4 md:grid-cols-2">{selectedLabelImages.map((src, index) => <div key={`${src}-modal-${index}`} className="overflow-hidden rounded-[18px] border border-slate-300 bg-white" style={{ width: `${printConfig.width}mm`, height: `${printConfig.height}mm` }}>{isHtmlLabel(src) ? renderHtmlLabel(src) : <img src={versionedSrc(src)} alt="preview" className="h-full w-full object-contain" />}</div>)}</div> : <div className="flex min-h-[240px] items-center justify-center text-sm text-[#8a8175]">프리셋 라벨 미리보기</div>) : <div className="mx-auto flex items-center justify-center"><div className="flex flex-col rounded-xl border border-slate-300 bg-white text-slate-800 shadow-sm" style={{ width: `${printConfig.width}mm`, height: `${printConfig.height}mm`, padding: `${printConfig.padding}mm` }}><div className="whitespace-pre-line" style={{ fontSize: `${fontSize}px`, textAlign, fontWeight: isBold ? "bold" : "normal", textDecoration: isUnderline ? "underline" : "none", lineHeight }}>{labelContent || "라벨 내용 미리보기"}</div></div></div>}</div></div></div>}
    </div>
  );
}

function LabelPreviewCard({ labelMode, printConfig, labelContent, fontSize, textAlign, isBold, isUnderline, lineHeight, selectedLabelImages }: { labelMode: LabelMode; printConfig: { width: number; height: number; padding: number; copies: number }; labelContent: string; fontSize: string; textAlign: "left" | "center" | "right"; isBold: boolean; isUnderline: boolean; lineHeight: string; selectedLabelImages: string[]; }) {
  return <Card className="rounded-3xl border border-[#e5dccf] bg-[#f3ede3]"><CardHeader><CardTitle className="text-xl text-[#3e372f]">출력 미리보기</CardTitle></CardHeader><CardContent>{labelMode === "image" ? <div className="rounded-2xl bg-[#ebe4d8] p-4"><div className="mx-auto grid grid-cols-2 justify-items-center w-fit place-content-center" style={{ columnGap: "12mm", rowGap: "6mm" }}>{selectedLabelImages.length > 0 ? selectedLabelImages.map((src, index) => <div key={`${src}-preview-${index}`} className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm" style={{ width: `${printConfig.width}mm`, height: `${printConfig.height}mm` }}>{isHtmlLabel(src) ? renderHtmlLabel(src) : <img src={versionedSrc(src)} alt={`출력용 라벨 ${index + 1}`} className="h-full w-full object-contain" />}</div>) : <div className="flex h-[180px] items-center justify-center text-sm text-[#8a8175]">프리셋 라벨 미리보기</div>}</div></div> : <div className="mx-auto flex items-center justify-center rounded-2xl bg-[#ebe4d8] p-4"><div className="flex flex-col rounded-xl border border-slate-300 bg-white text-slate-800 shadow-sm" style={{ width: `${printConfig.width}mm`, height: `${printConfig.height}mm`, padding: `${printConfig.padding}mm` }}><div className="whitespace-pre-line" style={{ fontSize: `${fontSize}px`, textAlign, fontWeight: isBold ? "bold" : "normal", textDecoration: isUnderline ? "underline" : "none", lineHeight }}>{labelContent || "라벨 내용 미리보기"}</div></div></div>}</CardContent></Card>;
}
