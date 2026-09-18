"use client";

import React from "react";

type PebbleButtonProps = {
  children: React.ReactNode;
  variant?: "light" | "sage";
  className?: string;
  onClick?: () => void;
  /** 토글형 버튼(분류 선택 등)일 때만 전달. 지정하지 않으면 aria-pressed는 렌더링되지 않습니다. */
  pressed?: boolean;
  /** 지정하면 <a download>로 렌더링됩니다 (예: 엑셀 다운로드 버튼). */
  href?: string;
  download?: string;
};

/**
 * 앱 전체 공용 버튼.
 * - page.tsx의 기존 PebbleButton과 동일한 모양/색상을 사용합니다.
 * - 비활성(light) 상태에 TabButton과 동일한 hover 리프트 효과(hover:-translate-y-[1px])를 추가해
 *   탭·버튼 간 호버 동작을 통일했습니다.
 * - focus-visible 아웃라인을 추가해 키보드 포커스 시 항상 표시되도록 했습니다
 *   (기존 DrugInfo 분류 버튼에는 있었으나 page.tsx의 PebbleButton에는 없던 부분입니다).
 * - href를 주면 <a download>로, 주지 않으면 <button>으로 렌더링되어
 *   "엑셀 다운로드"처럼 실제 링크 동작이 필요한 곳에도 같은 스타일을 쓸 수 있습니다.
 */
export default function PebbleButton({
  children,
  variant = "light",
  className = "",
  onClick,
  pressed,
  href,
  download,
}: PebbleButtonProps) {
  const base =
    "relative inline-flex items-center justify-center cursor-pointer rounded-full px-6 py-3 text-base font-semibold transition-all duration-200 ease-out border border-white/60 active:translate-y-[2px] active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A816C]";

  const sage =
    "bg-[#7A816C] text-white shadow-[0_14px_24px_rgba(116,106,88,0.22),0_3px_4px_rgba(255,255,255,0.28)_inset,0_-10px_16px_rgba(122,129,108,0.22)_inset]";

  const light =
    "bg-[#f7f2ec] text-[#6b6156] shadow-[0_12px_20px_rgba(116,106,88,0.15),0_2px_3px_rgba(255,255,255,0.85)_inset,0_-8px_14px_rgba(221,212,201,0.42)_inset] hover:-translate-y-[1px]";

  const classes = [base, variant === "sage" ? sage : light, className].join(" ");

  if (href) {
    return (
      <a href={href} download={download} aria-pressed={pressed} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-pressed={pressed} className={classes}>
      {children}
    </button>
  );
}
