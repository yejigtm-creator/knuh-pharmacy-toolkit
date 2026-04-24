"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type TabKey = "split" | "syrup" | "label";
type SplitMode = "mg" | "t";

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
  category: "take" | "stop" | "pictogram" | "prep";
  label: string;
  src: string;
};

const LABEL_STORAGE_KEY = "yj-pharmacy-labels-v1";
const IMAGE_ASSET_VERSION = "20260421-2";

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

const SYRUP_INFO: Record<string, { storage: string; duration: string }> = {
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
  { key: "prep-ventolin-neb", category: "prep", label: "벤토린 흡입액 조제방법", src: "/labels/벤토린흡입액_조제.png" },
  { key: "pictogram-fever-detail", category: "pictogram", label: "해열제 안내", src: "/labels/해열제_상세.png" },
  { key: "fever-6hr", category: "take", label: "38도이상 열날 때 6시간 간격으로 복용", src: "/labels/발열 시 복용(6hr).png" },
  { key: "sleep", category: "take", label: "수면장애 시 복용하세요", src: "/labels/수면장애 시 복용.png" },
  { key: "nausea", category: "take", label: "속이 울렁거릴 때 복용하세요", src: "/labels/속 울렁거릴 시 복용.png" },
  { key: "chest-pain", category: "take", label: "가슴 통증 시 혀밑에 1알 넣으세요", src: "/labels/가슴통증 시 복용.png" },
  { key: "hives", category: "take", label: "두드러기 발생 시 복용하세요", src: "/labels/두드러기 시 복용.png" },
  { key: "itching", category: "take", label: "가려움 발생 시 복용하세요", src: "/labels/가려움 시 복용.png" },
  { key: "diarrhea-medicine", category: "take", label: "(지사제) 설사 시 복용하세요", src: "/labels/(지사제)설사 시 복용.png" },
  { key: "fever", category: "take", label: "발열 시 복용하세요", src: "/labels/발열 시 복용.png" },
  { key: "pain", category: "take", label: "통증 심할 때 복용하세요", src: "/labels/통증 시 복용.png" },
  { key: "pain-fever", category: "take", label: "통증, 발열 시에만 복용하세요 / 6시간 간격 하루 4회까지", src: "/labels/통증, 발열 시 복용(6hr).png" },
  { key: "watery-diarrhea", category: "take", label: "물설사 하루 3~4회 이상 발생 시 복용", src: "/labels/물설사 시 복용.png" },
  { key: "headache", category: "take", label: "두통 있을 때 복용하세요", src: "/labels/두통 시 복용.png" },
  { key: "stop-diarrhea", category: "stop", label: "설사 시 복용 중단", src: "/labels/설사 시 복용 중단.png" },
  { key: "stop-drowsy", category: "stop", label: "졸림 심하면 중단하세요", src: "/labels/심한졸림 복용 중단.png" },
  { key: "stop-improve", category: "stop", label: "증상 호전 시 중단 가능", src: "/labels/호전 시 복용 중단.png" },
  { key: "stop-tremor", category: "stop", label: "떨림 시 중단하세요", src: "/labels/떨림 시 복용 중단.png" },
  { key: "stop-fussy", category: "stop", label: "보챔 심할 시 중단하세요", src: "/labels/보챔 시 복용 중단.png" },
  { key: "stop-loose-stool", category: "stop", label: "묽은변 호전되면 복용 중단", src: "/labels/묽은변 복용 중단.png" },
  { key: "pictogram-cough", category: "pictogram", label: "기침약", src: "/labels/기침약.png" },
  { key: "pictogram-cough-phlegm", category: "pictogram", label: "기침·가래약", src: "/labels/기침가래약.png" },
  { key: "pictogram-phlegm", category: "pictogram", label: "가래약", src: "/labels/가래약.png" },
  { key: "pictogram-runny-nose", category: "pictogram", label: "콧물약", src: "/labels/콧물약.png" },
  { key: "pictogram-runny-nose-itch", category: "pictogram", label: "콧물약, 가려움약", src: "/labels/콧물가려움약.png" },
  { key: "pictogram-stuffy-nose", category: "pictogram", label: "코막힘약", src: "/labels/코막힘약.png" },
  { key: "pictogram-inhaler", category: "pictogram", label: "흡입하는 약 (먹지 마세요)", src: "/labels/흡입약.png" },
  { key: "prep-augmentin-duo", category: "prep", label: "오구멘틴듀오 조제방법", src: "/labels/오구멘틴듀오 조제.png" },
  { key: "prep-amocraneo", category: "prep", label: "아모크라네오 조제방법", src: "/labels/아모크라네오 조제.png" },
];

const versionedSrc = (src: string): string => encodeURI(`${src}?v=${IMAGE_ASSET_VERSION}`);

const toNum = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const round = (value: number, digits = 2): number => {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
};

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

  return Math.min(
    ...quarterTargets.map((target) => {
      const diff = Math.abs(fraction - target);
      return Math.min(diff, 1 - diff);
    })
  );
};

const getPrecisionLabel = (totalTabs: number, score: number): string => {
  const fraction = ((totalTabs % 1) + 1) % 1;
  const integerDistance = Math.min(Math.abs(fraction - 0), Math.abs(1 - fraction));

  if (score === 0) {
    return integerDistance < 1e-9
      ? "정확히 정수"
      : Number.isInteger(totalTabs * 2)
        ? "정확히 0.5T"
        : "정확히 0.25T";
  }

  if (integerDistance <= 0.02) return "정수 근접";
  if (Math.min(Math.abs(fraction - 0.5), 1 - Math.abs(fraction - 0.5)) <= 0.02) return "0.5T 근접";
  return "0.25T 근접";
};

const getPracticalPenalty = (packs: number, totalTabs: number): number => {
  let packPenalty = 0;
  if (packs <= 4) packPenalty = 0;
  else if (packs <= 8) packPenalty = 5;
  else if (packs <= 12) packPenalty = 15;
  else packPenalty = 40;

  let totalTabsPenalty = 0;
  if (totalTabs <= 2) totalTabsPenalty = 0;
  else if (totalTabs <= 4) totalTabsPenalty = 5;
  else totalTabsPenalty = 15;

  return packPenalty + totalTabsPenalty;
};

const buildRecommendationReason = ({
  precisionLabel,
  packs,
  kind,
}: {
  precisionLabel: string;
  packs: number;
  kind?: "practical" | "accuracy";
}): string => {
  if (kind === "accuracy") return "오차 최소값 기준";
  if (packs <= 4) return `${precisionLabel} + 포수 적음`;
  if (packs <= 8) return `${precisionLabel} + 실무 적정 포수`;
  return `${precisionLabel} + 참고용 후보`;
};

const calculateResult = (strength: number, dose: number, packs: number): CalcResult | null => {
  if (strength <= 0 || dose <= 0 || packs <= 0) return null;

  const totalTabs = (dose * packs) / strength;
  const ratio = dose / strength;
  const actualPerPack = (totalTabs * strength) / packs;

  return {
    totalTabs: round(totalTabs),
    perPack: round(actualPerPack),
    ratio: round(ratio),
  };
};

const calculateTModeResult = (doseT: number, packs: number, strengthMg: number): CalcResult | null => {
  if (doseT <= 0 || packs <= 0) return null;

  return {
    totalTabs: round(doseT * packs),
    perPack: round(strengthMg > 0 ? doseT * strengthMg : 0),
    ratio: round(doseT),
  };
};

const buildMgRecommendations = (strength: number, dose: number): Recommendation[] => {
  if (strength <= 0 || dose <= 0) return [];

  const list: Recommendation[] = [];
  for (let i = 1; i <= 30; i += 1) {
    const totalTabs = (dose * i) / strength;
    const accuracy = getFractionScore(totalTabs);
    const precisionLabel = getPrecisionLabel(totalTabs, accuracy);
    list.push({
      packs: i,
      tabs: round(totalTabs),
      score: accuracy,
      accuracy,
      precisionLabel,
      reason: buildRecommendationReason({ precisionLabel, packs: i, kind: "practical" }),
      kind: "practical",
    });
  }

  return list.sort((a, b) => a.accuracy - b.accuracy || a.packs - b.packs).slice(0, 4);
};

const buildTRecommendations = (doseT: number, practicalPackLimit: number): Recommendation[] => {
  if (doseT <= 0) return [];

  const candidates: Recommendation[] = [];
  for (let i = 1; i <= 30; i += 1) {
    const totalTabs = doseT * i;
    const accuracy = getFractionScore(totalTabs);
    const score = accuracy * 100 + getPracticalPenalty(i, totalTabs);
    const precisionLabel = getPrecisionLabel(totalTabs, accuracy);
    candidates.push({
      packs: i,
      tabs: round(totalTabs),
      score,
      accuracy,
      precisionLabel,
      reason: buildRecommendationReason({ precisionLabel, packs: i, kind: "practical" }),
      kind: "practical",
    });
  }

  const within15 = candidates.filter((item) => item.packs <= practicalPackLimit);
  const exactWithin15 = within15
    .filter((item) => item.accuracy === 0)
    .sort((a, b) => a.packs - b.packs || a.tabs - b.tabs);

  const nearWithin15 = within15
    .filter((item) => item.accuracy > 0 && item.accuracy <= 0.02)
    .sort((a, b) => {
      // 실무 우선: 포수 적은 것 먼저, 그 다음 정확도
      return a.packs - b.packs || a.accuracy - b.accuracy || a.tabs - b.tabs;
    });

  const practicalRest = [...candidates].sort((a, b) => {
    const accuracyGap = Math.abs(a.accuracy - b.accuracy);
    if (a.packs <= practicalPackLimit && b.packs <= practicalPackLimit && accuracyGap >= 0.015) {
      return a.accuracy - b.accuracy || a.packs - b.packs;
    }
    return a.score - b.score || a.accuracy - b.accuracy || a.packs - b.packs;
  });

  const practicalTop3: Recommendation[] = [];
  const seen = new Set<string>();
  const addUnique = (item: Recommendation) => {
    const key = `${item.packs}-${item.tabs}`;
    if (!seen.has(key) && practicalTop3.length < 3) {
      seen.add(key);
      practicalTop3.push(item);
    }
  };

  exactWithin15.forEach(addUnique);
  nearWithin15.forEach(addUnique);
  practicalRest.forEach(addUnique);

  const accuracyBest = [...candidates].sort((a, b) => a.accuracy - b.accuracy || a.packs - b.packs)[0];
  const duplicated = practicalTop3.some((item) => item.packs === accuracyBest.packs && item.tabs === accuracyBest.tabs);
  if (!duplicated) {
    practicalTop3.push({ ...accuracyBest, kind: "accuracy", precisionLabel: "정확도 우선", reason: buildRecommendationReason({ precisionLabel: "정확도 우선", packs: accuracyBest.packs, kind: "accuracy" }) });
  }

  return practicalTop3;
};

const loadSavedLabels = (): SavedLabel[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LABEL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveSavedLabels = (labels: SavedLabel[]): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LABEL_STORAGE_KEY, JSON.stringify(labels));
};

const runSelfTests = (): void => {
  const case1 = calculateResult(75, 22, 4);
  console.assert(case1?.totalTabs === 1.17, "Expected totalTabs to be 1.17");
  console.assert(case1?.perPack === 22, "Expected perPack to be 22");
  console.assert(case1?.ratio === 0.29, "Expected ratio to be 0.29");

  const case2 = calculateResult(100, 25, 2);
  console.assert(case2?.totalTabs === 0.5, "Expected totalTabs to be 0.5");
  console.assert(case2?.perPack === 25, "Expected perPack to be 25");

  const recs = buildMgRecommendations(100, 25);
  console.assert(recs.length === 4, "Expected 4 recommendations");
  console.assert(recs[0].packs === 1, "Expected first recommendation to be 1 pack");

  console.assert(round((261.1 / 470) * 10, 2) === 5.56, "Expected 듀리세프 10mL to require 5.56g");
  console.assert(round(0.11 * 15, 2) === 1.65, "Expected 오구멘틴 듀오시럽 15mL to require 1.65g");
  console.assert(clampPositive("0", 3) === 3, "Expected clampPositive fallback");
  console.assert(LABEL_IMAGE_PRESETS.length > 10, "Expected image presets to exist");
  console.assert("ab☆cd".includes("☆"), "Expected symbol support");
};

runSelfTests();

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative cursor-pointer rounded-full px-8 py-3 text-base font-semibold transition-all duration-200 ease-out select-none",
        "border border-white/60",
        "active:translate-y-[2px] active:scale-[0.985]",
        active
          ? [
              "bg-[#7A816C] text-white",
              "shadow-[0_14px_24px_rgba(116,106,88,0.22),0_3px_4px_rgba(255,255,255,0.28)_inset,0_-10px_16px_rgba(122,129,108,0.22)_inset]",
              "after:absolute after:inset-[3px] after:rounded-full after:border after:border-white/20 after:content-['']",
            ].join(" ")
          : [
              "bg-[#f7f2ec] text-[#6b6156]",
              "shadow-[0_12px_20px_rgba(116,106,88,0.15),0_2px_3px_rgba(255,255,255,0.85)_inset,0_-8px_14px_rgba(221,212,201,0.42)_inset]",
              "hover:-translate-y-[1px] hover:shadow-[0_14px_24px_rgba(116,106,88,0.18),0_2px_3px_rgba(255,255,255,0.9)_inset,0_-8px_14px_rgba(221,212,201,0.46)_inset]",
              "after:absolute after:inset-[3px] after:rounded-full after:border after:border-white/40 after:content-['']",
            ].join(" "),
      ].join(" ")}
    >
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function PebbleButton({
  children,
  onClick,
  variant = "light",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "light" | "sage";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative cursor-pointer rounded-full px-6 py-3 text-base font-semibold transition-all duration-200 ease-out border border-white/60",
        "active:translate-y-[2px] active:scale-[0.985]",
        variant === "sage"
          ? "bg-[#7A816C] text-white shadow-[0_14px_24px_rgba(116,106,88,0.22),0_3px_4px_rgba(255,255,255,0.28)_inset,0_-10px_16px_rgba(122,129,108,0.22)_inset]"
          : "bg-[#f7f2ec] text-[#6b6156] shadow-[0_12px_20px_rgba(116,106,88,0.15),0_2px_3px_rgba(255,255,255,0.85)_inset,0_-8px_14px_rgba(221,212,201,0.42)_inset]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SectionCard({
  title,
  children,
  description,
}: {
  title: string;
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <Card className="rounded-3xl border border-[#e5dccf] bg-[#f3ede3]">
      <CardHeader>
        <CardTitle className="text-xl text-[#3e372f]">{title}</CardTitle>
        {description ? <div className="text-sm text-[#6e665b]">{description}</div> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function SplitDispenseMiniApp() {
  const [tab, setTab] = useState<TabKey>("split");
  const [strength, setStrength] = useState("");
  const [dose, setDose] = useState("");
  const [packs, setPacks] = useState("");

  const [selectedSyrup, setSelectedSyrup] = useState<string>(SORTED_SYRUP_DRUGS[0].name);
  const [syrupMl, setSyrupMl] = useState("");

  const [templateName, setTemplateName] = useState("");
  const [labelContent, setLabelContent] = useState("");
  const [fontSize, setFontSize] = useState("14");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [lineHeight, setLineHeight] = useState("1.6");
  const [savedLabels, setSavedLabels] = useState<SavedLabel[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [labelWidthMm, setLabelWidthMm] = useState("90");
  const [labelHeightMm, setLabelHeightMm] = useState("50");
  const [labelPaddingMm, setLabelPaddingMm] = useState("0");
  const [labelCopies, setLabelCopies] = useState("1");
  const [labelMode, setLabelMode] = useState<"text" | "image">("text");
  const [takeImageSelection, setTakeImageSelection] = useState("");
  const [stopImageSelection, setStopImageSelection] = useState("");
  const [pictogramImageSelection, setPictogramImageSelection] = useState("");
  const [prepImageSelection, setPrepImageSelection] = useState("");
  const [selectedLabelImages, setSelectedLabelImages] = useState<string[]>([]);
  const [favoriteImages, setFavoriteImages] = useState<string[]>([]);
  const labelTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const symbolButtons = ["☆", "★", "○", "●", "→"];

  useEffect(() => {
    setSavedLabels(loadSavedLabels());
    if (typeof window !== "undefined") {
      const fav = localStorage.getItem("yj-label-favorites");
      if (fav) setFavoriteImages(JSON.parse(fav));
    }
  }, []);

  const s = toNum(strength);
  const d = toNum(dose);
  const p = toNum(packs);
  const [splitMode, setSplitMode] = useState<SplitMode>("mg");
  const [practicalPackLimit, setPracticalPackLimit] = useState("15");

  const result = useMemo(
    () => (splitMode === "mg" ? calculateResult(s, d, p) : calculateTModeResult(d, p, s)),
    [splitMode, s, d, p]
  );

  const recs = useMemo(
    () => (splitMode === "mg" ? buildMgRecommendations(s, d) : buildTRecommendations(d, practicalPackLimit === "none" ? 30 : clampPositive(practicalPackLimit, 15))),
    [splitMode, s, d, practicalPackLimit]
  );

  useEffect(() => {
    if (recs.length > 0) {
      setPacks(String(recs[0].packs));
    }
  }, [recs]);

  const syrupResult = useMemo(() => {
    const ml = toNum(syrupMl);
    const drug = SORTED_SYRUP_DRUGS.find((item) => item.name === selectedSyrup);
    if (!drug || ml <= 0) return null;

    return {
      grams: round(drug.gramsPerMl * ml, 2),
      gramsPerMl: round(drug.gramsPerMl, 4),
    };
  }, [selectedSyrup, syrupMl]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "split", label: "분할조제 계산" },
    { key: "syrup", label: "건조시럽 조제" },
    { key: "label", label: "라벨 제작" },
  ];

  const printConfig = useMemo(() => {
    const width = clampPositive(labelWidthMm, 90);
    const height = clampPositive(labelHeightMm, 50);
    const padding = clampNonNegative(labelPaddingMm, 0);
    const copies = Math.max(1, Math.min(50, Math.floor(clampPositive(labelCopies, 1))));
    return { width, height, padding, copies };
  }, [labelWidthMm, labelHeightMm, labelPaddingMm, labelCopies]);

  const imagePresetsByCategory = useMemo(
    () => ({
      take: LABEL_IMAGE_PRESETS.filter((item) => item.category === "take").sort((a,b)=>a.label.localeCompare(b.label,"ko")),
      stop: LABEL_IMAGE_PRESETS.filter((item) => item.category === "stop").sort((a,b)=>a.label.localeCompare(b.label,"ko")),
      pictogram: LABEL_IMAGE_PRESETS.filter((item) => item.category === "pictogram").sort((a,b)=>a.label.localeCompare(b.label,"ko")),
      prep: LABEL_IMAGE_PRESETS.filter((item) => item.category === "prep").sort((a,b)=>a.label.localeCompare(b.label,"ko")),
    }),
    []
  );

  const handleSaveLabel = () => {
    const item: SavedLabel = {
      id: `${Date.now()}`,
      name: templateName || "라벨 템플릿",
      content: labelContent,
      createdAt: new Date().toISOString(),
    };

    const next = [item, ...savedLabels].slice(0, 30);
    setSavedLabels(next);
    saveSavedLabels(next);
  };

  const handleLoadLabel = (item: SavedLabel) => {
    setTemplateName(item.name);
    setLabelMode("text");
    setLabelContent(item.content);
  };

  const handleDeleteLabel = (id: string) => {
    const next = savedLabels.filter((item) => item.id !== id);
    setSavedLabels(next);
    saveSavedLabels(next);
  };

  const toggleFavorite = (src: string) => {
    setFavoriteImages((prev) => {
      const exists = prev.includes(src);
      const next = exists ? prev.filter((i) => i !== src) : [src, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("yj-label-favorites", JSON.stringify(next));
      }
      return next;
    });
  };

  const addImageLabel = (src: string) => {
    if (!src) return;
    setSelectedLabelImages((prev) => [...prev, src]);
    setLabelMode("image");
  };

  const handleTakeImageSelect = (value: string) => {
    if (!value) return;
    addImageLabel(value);
    setTakeImageSelection("");
  };

  const handleStopImageSelect = (value: string) => {
    if (!value) return;
    addImageLabel(value);
    setStopImageSelection("");
    setPictogramImageSelection("");
  };

  const handlePrepImageSelect = (value: string) => {
    if (!value) return;
    addImageLabel(value);
    setPrepImageSelection("");
  };

  const handlePictogramImageSelect = (value: string) => {
    if (!value) return;
    addImageLabel(value);
    setPictogramImageSelection("");
  };

  const removeSelectedImageAt = (index: number) => {
    setSelectedLabelImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSelectedImage = (index: number, direction: "up" | "down") => {
    setSelectedLabelImages((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const clearSelectedImages = () => {
    setSelectedLabelImages([]);
    setTakeImageSelection("");
    setStopImageSelection("");
    setPictogramImageSelection("");
    setPrepImageSelection("");
  };

  const insertSymbol = (symbol: string) => {
    const textarea = labelTextareaRef.current;

    if (!textarea) {
      setLabelContent((prev) => `${prev}${symbol}`);
      return;
    }

    const start = textarea.selectionStart ?? labelContent.length;
    const end = textarea.selectionEnd ?? labelContent.length;
    const nextValue = `${labelContent.slice(0, start)}${symbol}${labelContent.slice(end)}`;

    setLabelContent(nextValue);

    window.setTimeout(() => {
      textarea.focus();
      const nextCursor = start + symbol.length;
      textarea.setSelectionRange(nextCursor, nextCursor);
    }, 0);
  };

  const handlePrint = () => {
    if (typeof window === "undefined") return;

    const printTarget = document.getElementById("label-print");
    if (!printTarget) {
      window.alert("출력할 라벨을 찾을 수 없습니다.");
      return;
    }

    if (labelMode === "image" && selectedLabelImages.length === 0) {
      window.alert("출력할 이미지 라벨을 먼저 선택하세요.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=520,height=720");
    if (!printWindow) {
      window.alert("팝업이 차단되어 출력 창을 열 수 없습니다.");
      return;
    }

    const printableHtml = printTarget.innerHTML;

    const perSet =
      labelMode === "image"
        ? selectedLabelImages
            .map((src) =>
              Array.from({ length: printConfig.copies }, () => `<div class=\"label-image-wrap\"><img src="${versionedSrc(src)}" alt=\"label\" /></div>`).join("")
            )
            .join("")
        : Array.from({ length: printConfig.copies }, () => `<div class=\"label-sheet\">${printableHtml}</div>`).join("");

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html lang="ko">
        <head>
          <meta charset="utf-8" />
          <title>라벨 출력</title>
          <style>
            @page {
              size: ${printConfig.width}mm ${printConfig.height}mm;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: white;
              font-family: Arial, "Malgun Gothic", sans-serif;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-stack {
              display: flex;
              flex-direction: column;
              gap: 0;
              align-items: flex-start;
            }
            .label-sheet, .label-image-wrap {
              box-sizing: border-box;
              width: ${printConfig.width}mm;
              height: ${printConfig.height}mm;
              background: white;
              overflow: hidden;
              page-break-after: always;
            }
            .label-sheet {
              padding: ${printConfig.padding}mm;
              border: 0.25mm solid #d1d5db;
              border-radius: 4mm;
              color: #1f2937;
            }
            .label-image-wrap {
              display: flex;
              align-items: stretch;
              justify-content: stretch;
            }
            .label-image-wrap img {
              display: block;
              width: 100%;
              height: 100%;
              object-fit: contain;
              image-rendering: -webkit-optimize-contrast;
              image-rendering: crisp-edges;
            }
            .label-sheet:last-child, .label-image-wrap:last-child {
              page-break-after: auto;
            }
            .label-body {
              white-space: pre-line;
            }
          </style>
        </head>
        <body>
          <div class="print-stack">${perSet}</div>
        </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.focus();
    window.setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#e7dfd2] p-6">
      <style>{`
        html {
          overflow-y: scroll;
          scrollbar-gutter: stable;
        }
        button:not(:disabled), select, input[type="button"], input[type="submit"], input[type="reset"] {
          cursor: pointer;
        }
        button:disabled {
          cursor: not-allowed;
        }
        @media print {
          body * { visibility: hidden; }
          #label-print, #label-print * { visibility: visible; }
          #label-print {
            position: absolute;
            left: 0;
            top: 0;
            background: white;
          }
        }
      `}</style>

      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <div className="text-[11px] tracking-[0.25em] text-[#8a8175]">KNUH PHARMACY TOOLKIT</div>
          <div className="flex items-center gap-3">
            <div className="h-7 w-[3px] rounded bg-[#7A816C]" />
            <h1 className="text-3xl font-semibold tracking-tight leading-tight text-[#3f372f]">
              약제과 업무지원 도구
              <span className="ml-2 text-base font-normal text-[#8f8678]">· 산제조제</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[11px] tracking-wide text-[#b0a79a]">
            <span>pharmacy utility series</span>
            <span className="h-[2px] w-[2px] rounded-full bg-[#b0a79a]" />
            <span className="font-medium text-[#8f8678]">YJ</span>
            <span className="h-[2px] w-[2px] rounded-full bg-[#b0a79a]" />
            <span>v1.0</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {tabs.map((item) => (
            <TabButton key={item.key} active={tab === item.key} label={item.label} onClick={() => setTab(item.key)} />
          ))}
        </div>

        {tab === "split" && (
          <div className="space-y-6">
            <SectionCard title="분할조제 계산" description="mg 또는 T 단위 처방 기준으로 몇 정을 몇 포로 나눌지 계산">
              <div className="space-y-5">
                <div className="flex flex-wrap gap-3">
                  <PebbleButton onClick={() => setSplitMode("mg")} variant={splitMode === "mg" ? "sage" : "light"}>mg 기준</PebbleButton>
                  <PebbleButton onClick={() => setSplitMode("t")} variant={splitMode === "t" ? "sage" : "light"}>T 기준</PebbleButton>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  {splitMode === "mg" && (
                    <div>
                      <Label>약 1정 함량</Label>
                      <Input value={strength} onChange={(e) => setStrength(e.target.value)} placeholder="mg/tab" />
                    </div>
                  )}

                  <div>
                    <Label>{splitMode === "mg" ? "처방 1회 용량" : "처방 1회 용량(T)"}</Label>
                    <Input value={dose} onChange={(e) => setDose(e.target.value)} placeholder={splitMode === "mg" ? "mg" : "T"} />
                  </div>
                  <div>
                    <Label>나눌 포 수</Label>
                    <Input value={packs} onChange={(e) => setPacks(e.target.value)} placeholder="포" />
                  </div>
                </div>
                <div className="rounded-xl bg-[#ede6da] p-3 text-sm text-[#6f665a]">
                  {splitMode === "mg" ? "계산식: (처방용량 × 포수) ÷ 1정 함량" : "계산식: 처방 T × 포수 = 필요한 총 정수"}
                </div>
                {splitMode === "t" && (
                  <div className="space-y-3">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label>실무추천 포수 제한</Label>
                        <select
                          value={practicalPackLimit}
                          onChange={(e) => setPracticalPackLimit(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="10">10포 이하</option>
                          <option value="12">12포 이하</option>
                          <option value="15">15포 이하</option>
                          <option value="none">제한 없음</option>
                        </select>
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#e9f0e6] p-3 text-sm text-[#4b5a3f]">
                      T 기준 추천은 1~3순위는 실무추천, 마지막 항목은 정확도 우선값으로 표시됩니다.
                      <span className="ml-1">현재 실무추천 포수 제한은 {practicalPackLimit === "none" ? "없음" : `${practicalPackLimit}포 이하`}입니다.</span>
                      {s > 0 && d > 0 && <span className="ml-1">현재 입력값은 1포당 약 {round(d * s)} mg 기준입니다.</span>}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            <Card className="rounded-3xl border border-[#e5dccf] bg-[#f3ede3]">
              <CardContent className="space-y-4 p-6">
                <div>
                  <div className="text-sm text-[#6e665b]">필요한 총 정수</div>
                  <div className="text-2xl font-bold text-[#3f372f]">{result ? `${result.totalTabs} T` : "-"}</div>
                </div>
                {splitMode === "mg" && (
                  <div>
                    <div className="text-sm text-[#6e665b]">1포당 실제 함량</div>
                    <div className="text-xl text-[#3f372f]">{result ? `${result.perPack} mg` : "-"}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-[#6e665b]">정수 비율</div>
                  <div className="text-xl text-[#3f372f]">{result ? `${result.ratio} T` : "-"}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-[#e5dccf] bg-[#f3ede3]">
              <CardContent className="space-y-3 p-6">
                <div className="font-semibold text-[#3e372f]">추천 포 수</div>
                {recs.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {recs.map((r, i) => (
                      <PebbleButton
                        key={r.packs}
                        className={`w-full ${i === 0 ? "text-lg py-4 scale-[1.03]" : ""}`}
                        onClick={() => setPacks(String(r.packs))}
                        variant={i === 0 ? "sage" : "light"}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {i === 0 && <span>⭐</span>}
                          <span>{r.packs}포 ({r.tabs}T)</span>
                        </div>
                        <div className={`mt-1 text-xs ${i === 0 ? "text-white/85" : "text-[#8a8175]"}`}>
                          {r.precisionLabel}{r.kind === "accuracy" && <span className="ml-1">(정확도 우선)</span>}
                        </div>
                        <div className={`mt-1 text-[11px] ${i === 0 ? "text-white/75" : "text-[#9a9083]"}`}>
                          {r.reason}
                        </div>
                      </PebbleButton>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-[#8a8175]">값을 입력하면 추천됩니다</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "syrup" && (
          <div className="space-y-6">
            <SectionCard title="건조시럽 조제">
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>약품 선택</Label>
                    <select
                      value={selectedSyrup}
                      onChange={(e) => setSelectedSyrup(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {SORTED_SYRUP_DRUGS.map((drug) => (
                        <option key={drug.name} value={drug.name}>
                          {drug.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>제조할 최종 용량</Label>
                    <Input value={syrupMl} onChange={(e) => setSyrupMl(e.target.value)} placeholder="mL" />
                  </div>
                </div>
                {SYRUP_INFO[selectedSyrup] && (() => {
                  const info = SYRUP_INFO[selectedSyrup];
                  const isCold = info.storage === "냉장";
                  return (
                    <div
                      className={`rounded-xl p-4 text-base font-semibold ${
                        isCold
                          ? "bg-[#e3ebe6] text-[#4b5a3f]"
                          : "bg-[#efe3e6] text-[#6a4b4f]"
                      }`}
                    >
                      {isCold ? "❄️ " : "🏠 "}조제 후 {info.storage} 보관 / 유효기간 {info.duration}
                    </div>
                  );
                })()}
                <div className="rounded-xl bg-[#ede6da] p-3 text-sm text-[#6f665a]">
                  계산식: 약품별 g/mL × 제조할 mL = 필요한 분말량(g)
                </div>
              </div>
            </SectionCard>

            <Card className="rounded-3xl border border-[#e5dccf] bg-[#f3ede3]">
              <CardContent className="space-y-4 p-6">
                <div>
                  <div className="text-sm text-[#6e665b]">기준값</div>
                  <div className="text-xl font-semibold text-[#3f372f]">
                    {syrupResult ? `${syrupResult.gramsPerMl} g/mL` : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[#6e665b]">필요한 분말량</div>
                  <div className="text-2xl font-bold text-[#3f372f]">
                    {syrupResult ? `${syrupResult.grams} g` : "-"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "label" && (
          <div className="space-y-6">
            <SectionCard title="라벨 제작">
              <div className="mb-4 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <PebbleButton onClick={() => setLabelMode("text")} variant={labelMode === "text" ? "sage" : "light"}>
                    텍스트 라벨
                  </PebbleButton>
                  <PebbleButton onClick={() => setLabelMode("image")} variant={labelMode === "image" ? "sage" : "light"}>
                    이미지 라벨
                  </PebbleButton>
                </div>

                {labelMode === "image" && (
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 text-sm font-semibold text-[#6e665b]">이미지 라벨 선택</div>
                      {favoriteImages.length > 0 && (
                        <div className="mb-4 rounded-2xl border border-[#e5dccf] bg-white p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="text-sm font-semibold text-[#6e665b]">즐겨찾기</div>
                            <div className="text-xs text-[#8a8175]">★ 버튼으로 추가/해제</div>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                            {favoriteImages
                              .map((src) => LABEL_IMAGE_PRESETS.find((item) => item.src === src))
                              .filter((item): item is LabelImagePreset => Boolean(item))
                              .map((item) => (
                                <button
                                  key={`favorite-${item.key}`}
                                  type="button"
                                  onClick={() => addImageLabel(item.src)}
                                  className="flex items-center justify-between rounded-xl border border-[#e5dccf] bg-[#f8f4ed] px-3 py-2 text-left text-sm text-[#5f574d] hover:bg-[#f1eadf]"
                                >
                                  <span className="truncate pr-2">{item.label}</span>
                                  <span className="text-[#b08b2e]">★</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <Label>복용 이미지</Label>
                          <select
                            value={takeImageSelection}
                            onChange={(e) => {
                              const value = e.target.value;
                              setTakeImageSelection(value);
                              handleTakeImageSelect(value);
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">복용 이미지 선택</option>
                            {imagePresetsByCategory.take.map((item) => (
                              <option key={item.key} value={item.src}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label>복용 중단 이미지</Label>
                          <select
                            value={stopImageSelection}
                            onChange={(e) => {
                              const value = e.target.value;
                              setStopImageSelection(value);
                              handleStopImageSelect(value);
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">복용 중단 이미지 선택</option>
                            {imagePresetsByCategory.stop.map((item) => (
                              <option key={item.key} value={item.src}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label>약종류</Label>
                          <select
                            value={pictogramImageSelection}
                            onChange={(e) => {
                              const value = e.target.value;
                              setPictogramImageSelection(value);
                              handlePictogramImageSelect(value);
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">약종류 선택</option>
                            {imagePresetsByCategory.pictogram.map((item) => (
                              <option key={item.key} value={item.src}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label>조제방법</Label>
                          <select
                            value={prepImageSelection}
                            onChange={(e) => {
                              const value = e.target.value;
                              setPrepImageSelection(value);
                              handlePrepImageSelect(value);
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">조제방법 선택</option>
                            {imagePresetsByCategory.prep.map((item) => (
                              <option key={item.key} value={item.src}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-[#8a8175]">이미지를 선택하면 목록에 추가되고, 선택한 순서대로 출력됩니다.</div>
                      
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <Label>선택된 이미지 라벨 목록</Label>
                        {selectedLabelImages.length > 0 && (
                          <button type="button" onClick={clearSelectedImages} className="text-sm text-[#8a8175] underline underline-offset-2">
                            전체 비우기
                          </button>
                        )}
                      </div>
                      <div className="rounded-2xl border border-input bg-background p-4">
                        {selectedLabelImages.length > 0 ? (
                          <div className="grid gap-3 md:grid-cols-2">
                            {selectedLabelImages.map((src, index) => (
                              <div key={`${src}-${index}`} className="rounded-xl border border-[#e5dccf] bg-white p-3">
                                <div className="relative">
                                  <img src={versionedSrc(src)} alt={`선택된 라벨 ${index + 1}`} className="mx-auto max-h-[180px] w-full object-contain [image-rendering:crisp-edges]" />
                                  <button
                                    type="button"
                                    onClick={() => toggleFavorite(src)}
                                    className="absolute top-1 right-1 rounded bg-white/80 px-1 text-xs"
                                  >
                                    ★
                                  </button>
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-2 text-sm text-[#6e665b]">
                                  <span>{index + 1}번 라벨</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => moveSelectedImage(index, "up")}
                                      disabled={index === 0}
                                      className="text-[#8a8175] underline underline-offset-2 disabled:no-underline disabled:opacity-40"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveSelectedImage(index, "down")}
                                      disabled={index === selectedLabelImages.length - 1}
                                      className="text-[#8a8175] underline underline-offset-2 disabled:no-underline disabled:opacity-40"
                                    >
                                      ↓
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeSelectedImageAt(index)}
                                      className="text-[#8a8175] underline underline-offset-2"
                                    >
                                      제거
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex min-h-[220px] items-center justify-center text-sm text-[#8a8175]">
                            드롭박스에서 이미지 라벨을 선택하세요
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {labelMode === "text" && (
                  <>
                    <div>
                      <Label>템플릿명</Label>
                      <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="예: 아목시실린 기본 라벨" />
                    </div>

                    <div>
                      <Label>라벨 내용</Label>
                      <div className="mt-2 mb-3 flex flex-wrap gap-2">
                        <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="rounded border px-2 py-1 text-sm">
                          <option value="24">작게</option>
                          <option value="30">보통</option>
                          <option value="36">크게</option>
                          <option value="42">매우 크게</option>
                        </select>

                        <select value={textAlign} onChange={(e) => setTextAlign(e.target.value as "left" | "center" | "right")} className="rounded border px-2 py-1 text-sm">
                          <option value="left">좌측</option>
                          <option value="center">가운데</option>
                          <option value="right">우측</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => setIsBold((v) => !v)}
                          className={`rounded border px-3 py-1 text-sm ${isBold ? "bg-[#7A816C] text-white" : "bg-white"}`}
                        >
                          B
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsUnderline((v) => !v)}
                          className={`rounded border px-3 py-1 text-sm ${isUnderline ? "bg-[#7A816C] text-white" : "bg-white"}`}
                        >
                          U
                        </button>

                        <select value={lineHeight} onChange={(e) => setLineHeight(e.target.value)} className="rounded border px-2 py-1 text-sm">
                          <option value="1.4">좁게</option>
                          <option value="1.6">기본</option>
                          <option value="1.8">넓게</option>
                        </select>

                        <div className="flex flex-wrap gap-2">
                          {symbolButtons.map((symbol) => (
                            <button key={symbol} type="button" onClick={() => insertSymbol(symbol)} className="rounded border bg-white px-3 py-1 text-sm hover:bg-[#f3ede3]">
                              {symbol}
                            </button>
                          ))}

                          <button type="button" onClick={() => setLabelContent("")} className="rounded border bg-white px-3 py-1 text-sm text-[#6b6156] hover:bg-[#f3ede3]">
                            초기화
                          </button>
                        </div>
                      </div>

                      <textarea
                        ref={labelTextareaRef}
                        value={labelContent}
                        onChange={(e) => setLabelContent(e.target.value)}
                        placeholder={`예:
아목시실린 건조시럽
1회 1포, 1일 3회
식후 복용
냉암소 보관`}
                        className="min-h-[220px] w-full rounded-2xl border border-input bg-background px-3 py-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </>
                )}

                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label>라벨 가로(mm)</Label>
                    <Input value={labelWidthMm} onChange={(e) => setLabelWidthMm(e.target.value)} placeholder="90" />
                  </div>
                  <div>
                    <Label>라벨 세로(mm)</Label>
                    <Input value={labelHeightMm} onChange={(e) => setLabelHeightMm(e.target.value)} placeholder="50" />
                  </div>
                  <div>
                    <Label>내부 여백(mm)</Label>
                    <Input value={labelPaddingMm} onChange={(e) => setLabelPaddingMm(e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label>{labelMode === "image" ? "세트 반복 수량" : "출력 수량"}</Label>
                    <Input value={labelCopies} onChange={(e) => setLabelCopies(e.target.value)} placeholder="1" />
                  </div>
                </div>
              </div>

              <div className="mt-6 mb-2 flex flex-wrap gap-3">
                {labelMode === "text" && (
                  <PebbleButton onClick={handleSaveLabel} variant="sage">
                    라벨 저장
                  </PebbleButton>
                )}
                <PebbleButton onClick={() => setPreviewOpen(true)} variant="light">
                  라벨 크게 보기
                </PebbleButton>
                <PebbleButton onClick={handlePrint} variant="light">
                  라벨 출력
                </PebbleButton>
              </div>
            </SectionCard>

            {labelMode === "text" ? (
              <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                <Card className="rounded-3xl border border-[#e5dccf] bg-[#f3ede3]">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#3e372f]">저장된 라벨</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {savedLabels.length > 0 ? (
                      savedLabels.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-[#e5dccf] bg-white p-4">
                          <div className="font-semibold text-[#3e372f]">{item.name}</div>
                          <div className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-[#6e665b]">{item.content || "내용 없음"}</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => handleLoadLabel(item)}>
                              불러오기
                            </Button>
                            <Button variant="outline" onClick={() => handleDeleteLabel(item.id)}>
                              삭제
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-[#8a8175]">저장된 라벨이 없습니다.</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border border-[#e5dccf] bg-[#f3ede3]">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#3e372f]">출력 미리보기</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mx-auto flex items-center justify-center rounded-2xl bg-[#ebe4d8] p-4">
                      <div
                        id="label-print"
                        className="flex flex-col rounded-xl border border-slate-300 bg-white text-slate-800 shadow-sm"
                        style={{ width: `${printConfig.width}mm`, height: `${printConfig.height}mm`, padding: `${printConfig.padding}mm` }}
                      >
                        <div
                          className="label-body whitespace-pre-line"
                          style={{
                            fontSize: `${fontSize}px`,
                            textAlign,
                            fontWeight: isBold ? "bold" : "normal",
                            textDecoration: isUnderline ? "underline" : "none",
                            lineHeight,
                          }}
                        >
                          {labelContent || "라벨 내용 미리보기"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="rounded-3xl border border-[#e5dccf] bg-[#f3ede3]">
                <CardHeader>
                  <CardTitle className="text-xl text-[#3e372f]">출력 미리보기</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl bg-[#ebe4d8] p-4">
                    <div id="label-print" className="grid gap-4">
                      {selectedLabelImages.length > 0 ? (
                        selectedLabelImages.map((src, index) => (
                          <div
                            key={`${src}-preview-${index}`}
                            className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm"
                            style={{ width: `${printConfig.width}mm`, height: `${printConfig.height}mm` }}
                          >
                            <img src={versionedSrc(src)} alt={`출력용 라벨 ${index + 1}`} className="h-full w-full object-contain [image-rendering:crisp-edges]" />
                          </div>
                        ))
                      ) : (
                        <div className="flex h-[180px] items-center justify-center text-sm text-[#8a8175]">이미지 라벨 미리보기</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-6 py-10">
          <div className="w-full max-w-4xl rounded-[28px] border border-white/40 bg-[#f3ede3] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xl font-semibold text-[#3e372f]">라벨 크게 보기</div>
                <div className="mt-1 text-sm text-[#6e665b]">
                  {printConfig.width} × {printConfig.height} mm · 여백 {printConfig.padding} mm
                </div>
              </div>
              <PebbleButton onClick={() => setPreviewOpen(false)} variant="light">닫기</PebbleButton>
            </div>

            <div className="overflow-auto rounded-3xl bg-[#ebe4d8] p-8">
              {labelMode === "image" ? (
                selectedLabelImages.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedLabelImages.map((src, index) => (
                      <div key={`${src}-modal-${index}`} className="overflow-hidden rounded-[18px] border border-slate-300 bg-white">
                        <img src={versionedSrc(src)} alt="preview" className="h-full w-full object-contain [image-rendering:crisp-edges]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[240px] items-center justify-center text-sm text-[#8a8175]">이미지 라벨 미리보기</div>
                )
              ) : (
                <div className="mx-auto flex items-center justify-center">
                  <div className="bg-white p-6 border rounded">
                    {labelContent || "라벨 내용 미리보기"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
