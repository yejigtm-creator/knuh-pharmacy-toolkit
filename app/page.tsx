import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type TabKey = "split" | "syrup" | "label";

type Recommendation = {
  packs: number;
  tabs: number;
  score: number;
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

const LABEL_STORAGE_KEY = "yj-pharmacy-labels-v1";

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

const toNum = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const round = (value: number, digits = 2): number => {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
};

const getFractionScore = (tabs: number): number => {
  const fraction = tabs - Math.floor(tabs);
  const candidates = [0, 0.25, 0.5, 0.75];
  return Math.min(...candidates.map((c) => Math.abs(fraction - c)));
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

const buildRecommendations = (strength: number, dose: number): Recommendation[] => {
  if (strength <= 0 || dose <= 0) return [];

  const list: Recommendation[] = [];

  for (let i = 1; i <= 30; i += 1) {
    const totalTabs = (dose * i) / strength;
    list.push({
      packs: i,
      tabs: round(totalTabs),
      score: getFractionScore(totalTabs),
    });
  }

  return list.sort((a, b) => a.score - b.score || a.packs - b.packs).slice(0, 4);
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

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative rounded-full px-8 py-3 text-base font-semibold transition-all duration-200 ease-out select-none",
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
  const [savedLabels, setSavedLabels] = useState<SavedLabel[]>([]);

  useEffect(() => {
    setSavedLabels(loadSavedLabels());
  }, []);

  const s = toNum(strength);
  const d = toNum(dose);
  const p = toNum(packs);

  const result = useMemo(() => calculateResult(s, d, p), [s, d, p]);
  const recs = useMemo(() => buildRecommendations(s, d), [s, d]);

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
    setLabelContent(item.content);
  };

  const handleDeleteLabel = (id: string) => {
    const next = savedLabels.filter((item) => item.id !== id);
    setSavedLabels(next);
    saveSavedLabels(next);
  };

  const handlePrint = () => {
    if (typeof window === "undefined") return;

    const printTarget = document.getElementById("label-print");
    if (!printTarget) {
      window.alert("출력할 라벨을 찾을 수 없습니다.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=420,height=320");
    if (!printWindow) {
      window.alert("팝업이 차단되어 출력 창을 열 수 없습니다.");
      return;
    }

    const printableHtml = printTarget.innerHTML;

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html lang="ko">
        <head>
          <meta charset="utf-8" />
          <title>라벨 출력</title>
          <style>
            @page {
              size: 90mm 50mm;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 90mm;
              height: 50mm;
              background: white;
              font-family: Arial, "Malgun Gothic", sans-serif;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .label-sheet {
              box-sizing: border-box;
              width: 90mm;
              height: 50mm;
              padding: 4mm;
              border: 1px solid #d1d5db;
              border-radius: 4mm;
              color: #1f2937;
              background: white;
              overflow: hidden;
            }
            .label-sheet .label-header {
              font-size: 10px;
              letter-spacing: 0.08em;
              color: #6b7280;
            }
            .label-sheet .label-body {
              margin-top: 3mm;
              white-space: pre-line;
              font-size: 13px;
              line-height: 1.55;
            }
          </style>
        </head>
        <body>
          <div class="label-sheet">${printableHtml}</div>
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
        @media print {
          body * { visibility: hidden; }
          #label-print, #label-print * { visibility: visible; }
          #label-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 90mm;
            height: 50mm;
            margin: 0;
            padding: 0;
            background: white;
          }
        }
      `}</style>

      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <div className="text-[11px] tracking-[0.25em] text-[#8a8175]">
            KNUH PHARMACY TOOLKIT
          </div>

          <h1 className="text-3xl font-semibold text-[#3f372f] tracking-tight leading-tight">
            약제과 업무지원 도구
            <span className="ml-2 text-base font-normal text-[#8f8678]">
              · 산제조제
            </span>
          </h1>

          <div className="flex items-center gap-2 text-[11px] text-[#b0a79a] tracking-wide">
            <span>pharmacy utility series</span>
            <span className="w-[2px] h-[2px] bg-[#b0a79a] rounded-full" />
            <span className="font-medium text-[#8f8678]">YJ</span>
            <span className="w-[2px] h-[2px] bg-[#b0a79a] rounded-full" />
            <span>v1.0</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {tabs.map((item) => (
            <TabButton
              key={item.key}
              active={tab === item.key}
              label={item.label}
              onClick={() => setTab(item.key)}
            />
          ))}
        </div>

        {tab === "split" ? (
          <div className="space-y-6">
            <SectionCard title="분할조제 계산" description="예: 75mg 정 → 22mg 처방 시 몇 정을 몇 포로 나눌지 계산">
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>약 1정 함량</Label>
                    <Input value={strength} onChange={(e) => setStrength(e.target.value)} placeholder="mg/tab" />
                  </div>

                  <div>
                    <Label>처방 1회 용량</Label>
                    <Input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="mg" />
                  </div>

                  <div>
                    <Label>나눌 포 수</Label>
                    <Input value={packs} onChange={(e) => setPacks(e.target.value)} placeholder="포" />
                  </div>
                </div>

                <div className="rounded-xl bg-[#ede6da] p-3 text-sm text-[#6f665a]">
                  계산식: (처방용량 × 포수) ÷ 1정 함량
                </div>
              </div>
            </SectionCard>

            <Card className="rounded-3xl border border-[#e5dccf] bg-[#f3ede3]">
              <CardContent className="space-y-4 p-6">
                <div>
                  <div className="text-sm text-[#6e665b]">필요한 총 정수</div>
                  <div className="text-2xl font-bold text-[#3f372f]">{result ? `${result.totalTabs} T` : "-"}</div>
                </div>

                <div>
                  <div className="text-sm text-[#6e665b]">1포당 실제 함량</div>
                  <div className="text-xl text-[#3f372f]">{result ? `${result.perPack} mg` : "-"}</div>
                </div>

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
                  <div className="flex flex-wrap gap-2">
                    {recs.map((r, i) => (
                      <Button
                        key={r.packs}
                        onClick={() => setPacks(String(r.packs))}
                        className={[
                          "relative rounded-full px-6 py-3 text-base font-semibold transition-all duration-200 ease-out border border-white/60",
                          "active:translate-y-[2px] active:scale-[0.985]",
                          i === 0
                            ? "bg-[#7A816C] text-white shadow-[0_12px_20px_rgba(116,106,88,0.2),0_3px_4px_rgba(255,255,255,0.26)_inset,0_-8px_12px_rgba(122,129,108,0.2)_inset]"
                            : "bg-[#fbf8f3] text-[#3e372f] shadow-[0_10px_18px_rgba(116,106,88,0.12),0_2px_3px_rgba(255,255,255,0.82)_inset,0_-7px_12px_rgba(221,212,201,0.36)_inset]",
                        ].join(" ")}
                      >
                        {r.packs}포 ({r.tabs}T)
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-[#8a8175]">값을 입력하면 추천됩니다</div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : tab === "syrup" ? (
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
        ) : (
          <div className="space-y-6">
            <SectionCard title="라벨 제작" description="자주 사용하는 라벨을 저장하고 다시 불러와 출력할 수 있습니다.">
              <div className="space-y-4">
                <div>
                  <Label>템플릿명</Label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="예: 아목시실린 기본 라벨"
                  />
                </div>
                <div>
                  <Label>라벨 내용</Label>
                  <textarea
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
              </div>

              <div className="mt-6 mb-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveLabel}
                  className={[
                    "relative rounded-full px-6 py-3 text-base font-semibold transition-all duration-200 ease-out border border-white/60",
                    "bg-[#7A816C] text-white",
                    "shadow-[0_14px_24px_rgba(116,106,88,0.22),0_3px_4px_rgba(255,255,255,0.28)_inset,0_-10px_16px_rgba(122,129,108,0.22)_inset]",
                    "active:translate-y-[2px] active:scale-[0.985]",
                  ].join(" ")}
                >
                  라벨 저장
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className={[
                    "relative rounded-full px-6 py-3 text-base font-semibold transition-all duration-200 ease-out border border-white/60",
                    "bg-[#f7f2ec] text-[#6b6156]",
                    "shadow-[0_12px_20px_rgba(116,106,88,0.15),0_2px_3px_rgba(255,255,255,0.85)_inset,0_-8px_14px_rgba(221,212,201,0.42)_inset]",
                    "active:translate-y-[2px] active:scale-[0.985]",
                  ].join(" ")}
                >
                  라벨 출력
                </button>
              </div>
            </SectionCard>

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
                        <div className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-[#6e665b]">
                          {item.content || "내용 없음"}
                        </div>
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
                  <div
                    id="label-print"
                    className="mx-auto flex h-[50mm] w-[90mm] flex-col rounded-xl border border-slate-300 bg-white p-4 text-slate-800"
                  >
                    <div className="label-header text-[10px] tracking-wide text-slate-500">YJ PHARMACY LABEL</div>
                    <div className="label-body mt-3 whitespace-pre-line text-sm leading-6">
                      {labelContent || "라벨 내용 미리보기"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
