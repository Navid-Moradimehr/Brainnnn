"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getStructureColor } from "./structureColors";
import type { CandidatePlan } from "@/types";

interface Props {
  plan: CandidatePlan;
  reference?: CandidatePlan;
  visibleIds: ReadonlySet<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const REFERENCE_IDS = new Set(["gtv", "ctv", "ptv", "brainstem", "chiasm", "nerve-l"]);

export function DvhChart({ plan, reference, visibleIds, selectedId, onSelect }: Props) {
  const candidateCurves = plan.dvh.filter((c) => visibleIds.has(c.structureId));
  const refCurves =
    reference?.dvh.filter((c) => REFERENCE_IDS.has(c.structureId)) ?? [];

  return (
    <div>
      <ResponsiveContainer width="100%" height={252}>
        <LineChart margin={{ top: 8, right: 8, bottom: 4, left: -18 }} onClick={() => undefined}>
          <CartesianGrid stroke="#212a38" strokeDasharray="2 4" />
          <XAxis
            dataKey="doseGy"
            type="number"
            domain={[0, 66]}
            ticks={[0, 15, 30, 45, 60]}
            tick={{ fill: "#8b94a7", fontSize: 10, fontFamily: "var(--font-plex-mono)" }}
            stroke="#2a3444"
            label={{
              value: "Dose (Gy)",
              position: "insideBottomRight",
              offset: -2,
              fill: "#8b94a7",
              fontSize: 10,
            }}
          />
          <YAxis
            tick={{ fill: "#8b94a7", fontSize: 10, fontFamily: "var(--font-plex-mono)" }}
            stroke="#2a3444"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip
            cursor={{ stroke: "#3aa6d8", strokeWidth: 0.6 }}
            contentStyle={{
              background: "#141a24",
              border: "1px solid #27303f",
              borderRadius: 6,
              fontSize: 11,
              fontFamily: "var(--font-plex-mono)",
            }}
            labelFormatter={(v) => `${v} Gy`}
            formatter={(value, name) => {
              void name;
              return [`${Number(value).toFixed(1)} %`, ""];
            }}
          />
          {refCurves.map((c) => (
            <Line
              key={`ref-${c.structureId}`}
              data={c.points}
              dataKey="volumePct"
              stroke={getStructureColor(c.structureId)}
              strokeWidth={selectedId === c.structureId ? 2 : 1}
              strokeDasharray="5 4"
              strokeOpacity={selectedId && selectedId !== c.structureId ? 0.25 : 0.55}
              dot={false}
              isAnimationActive={false}
            />
          ))}
          {candidateCurves.map((c) => (
            <Line
              key={`cand-${c.structureId}`}
              data={c.points}
              dataKey="volumePct"
              stroke={getStructureColor(c.structureId)}
              strokeWidth={selectedId === c.structureId ? 2.6 : 1.5}
              strokeOpacity={
                !selectedId || selectedId === c.structureId ? 1 : 0.28
              }
              activeDot={false}
              dot={false}
              isAnimationActive={false}
              onClick={(e) => {
                void e;
                onSelect(c.structureId);
              }}
              style={{ cursor: "pointer" }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {reference && (
        <p className="mt-1 text-right text-[10px] text-muted-foreground">
          dashed = reference plan · solid = candidate forecast · click a curve to inspect
        </p>
      )}
    </div>
  );
}
