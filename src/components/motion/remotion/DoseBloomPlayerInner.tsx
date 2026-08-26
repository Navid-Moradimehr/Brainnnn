"use client";

import { Player } from "@remotion/player";
import { DoseIsolines } from "./DoseIsolines";
import { useReducedMotion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";

/** Inner player — loaded via next/dynamic from DoseBloomPlayer. */
export function DoseBloomPlayerInner({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const { t } = useI18n();
  return (
    <div
      role="img"
      aria-label="Animated research candidate dose forecast illustration"
      className={`overflow-hidden rounded-md border border-border bg-[#05070b] ${className ?? ""}`}
    >
      <Player
        component={DoseIsolines}
        durationInFrames={210}
        compositionWidth={640}
        compositionHeight={400}
        fps={30}
        inputProps={{ tag: t("generate.forecastTag") }}
        style={{ width: "100%", height: "100%" }}
        autoPlay={!reduce}
        loop={!reduce}
        initiallyMuted
        acknowledgeRemotionLicense
      />
    </div>
  );
}
