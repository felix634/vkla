"use client";

import { useState } from "react";
import { AGE_GROUPS } from "../lib/ageGroups";
import GroupFilter from "./site/GroupFilter";
import SoonBadge from "./site/SoonBadge";
import type { HetirendData } from "../lib/sanity/tartalom";

const DAYS = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek"];
const WEEKEND = ["Szombat", "Vasárnap"];
const GROUP_NAMES = AGE_GROUPS.map((g) => g.name);

// Heti edzésterv korosztály-választóval (jegyzőkönyv: "heti program
// megjelenése minden korosztályhoz"). Az időpontok a CMS "Heti edzésrend"
// dokumentumaiból jönnek; amíg nincsenek, a látványterv-placeholder látszik.
export default function WeeklySchedule({ rendek }: { rendek?: HetirendData[] | null }) {
  const cmsOn = !!(rendek && rendek.length > 0);
  const groupOptions = cmsOn ? rendek!.map((r) => r.korosztaly) : GROUP_NAMES;
  const [filter, setFilter] = useState("Összes");

  // Hétvégi oszlop csak akkor, ha van rá bejegyzés.
  const days = cmsOn
    ? [...DAYS, ...WEEKEND.filter((w) =>
        rendek!.some((r) => r.entries?.some((e) => e.day === w))
      )]
    : DAYS;

  const cmsSlotsFor = (day: string) =>
    rendek!
      .filter((r) => filter === "Összes" || r.korosztaly === filter)
      .flatMap((r) =>
        (r.entries ?? [])
          .filter((e) => e.day === day)
          .map((e) => ({ korosztaly: r.korosztaly, ...e }))
      )
      .sort((a, b) => (a.from ?? "").localeCompare(b.from ?? ""));

  const placeholderSlotsFor = (dayIndex: number) =>
    filter === "Összes"
      ? [0, 1, 2].map((i) => GROUP_NAMES[(dayIndex * 3 + i) % GROUP_NAMES.length])
      : [filter, filter];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <GroupFilter filter={filter} setFilter={setFilter} options={groupOptions} />
        {!cmsOn && <SoonBadge label="CMS időpontok — hamarosan" />}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {days.map((d, di) => (
          <div key={`${filter}-${d}`} className="rounded-md border border-gray-100 bg-cream overflow-hidden">
            <div className="bg-navy text-white font-display font-bold text-center py-2.5">{d}</div>
            <div className="divide-y divide-gray-200/60">
              {cmsOn ? (
                cmsSlotsFor(d).length > 0 ? (
                  cmsSlotsFor(d).map((s, i) => (
                    <div key={i} className="px-3 py-3">
                      <div className="text-vasasRed font-bold text-sm">
                        {s.from ?? "—:—"} – {s.to ?? "—:—"}
                      </div>
                      <div className="text-navy/60 text-xs mt-0.5">
                        {s.korosztaly}
                        {s.location ? ` · ${s.location}` : ""}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-3 text-navy/40 text-xs">Nincs edzés</div>
                )
              ) : (
                placeholderSlotsFor(di).map((g, i) => (
                  <div key={i} className="px-3 py-3">
                    <div className="text-vasasRed font-bold text-sm">—:— – —:—</div>
                    <div className="text-navy/60 text-xs mt-0.5">{g} · pálya</div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
