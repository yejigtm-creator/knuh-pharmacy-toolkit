"use client";

import React, { useState } from "react";
import PebbleButton from "@/components/ui/PebbleButton";
import TopicalSteroidInfo from "@/components/TopicalSteroidInfo";
import AntimicrobialInfo from "@/components/AntimicrobialInfo";
import InsulinInfo from "@/components/InsulinInfo";

import PreoperativeMedicationInfo from "@/components/PreoperativeMedicationInfo";

export default function DrugInfo() {
  const [category, setCategory] = useState<"steroid" | "antimicrobial" | "insulin" | "preoperative">("steroid");
  return (
    <div className="min-w-0 space-y-6">
      <nav aria-label="약품정보 분류" className="flex flex-wrap gap-3">
        {([{ key: "steroid", label: "스테로이드 외용제" }, { key: "antimicrobial", label: "항감염제" }, { key: "insulin", label: "인슐린" }, { key: "preoperative", label: "수술 전 약물 확인" }] as const).map(item => (
          <PebbleButton
            key={item.key}
            variant={category === item.key ? "sage" : "light"}
            pressed={category === item.key}
            onClick={() => setCategory(item.key)}
          >
            {item.label}
          </PebbleButton>
        ))}
      </nav>
      {category === "steroid" && <TopicalSteroidInfo />}
      {category === "antimicrobial" && <AntimicrobialInfo />}
      {category === "insulin" && <InsulinInfo />}
      {category === "preoperative" && <PreoperativeMedicationInfo />}
    </div>
  );
}
