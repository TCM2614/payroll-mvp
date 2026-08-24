"use client";

import { useEffect, useRef } from "react";
import {
  trackPayRiseView,
  trackPercentileView,
  trackSalaryPageView,
  trackTaxTrapView,
} from "@/lib/analytics";

/**
 * Client-only fire-and-forget instrumentation for the growth-phase server
 * pages. Each page mounts this at the top level once and the appropriate
 * `*_viewed` event is dispatched exactly once per navigation.
 *
 * Kept in a single component so every acquisition surface uses the same
 * `useEffect` pattern (once-per-mount, StrictMode-safe via `useRef`).
 */

type SalaryProps = {
  event: "salary_page_viewed";
  salary: number;
  salaryPage: string;
  taxYear: string;
};

type PayRiseProps = {
  event: "pay_rise_viewed";
  from: number;
  to: number;
};

type TaxTrapProps = {
  event: "tax_trap_viewed";
  surface?: string;
};

type PercentileProps = {
  event: "percentile_viewed";
  salaryBand?:
    | "<30k"
    | "30-60k"
    | "60-100k"
    | ">100k";
  ageBand?: string;
};

export type PageViewProps =
  | SalaryProps
  | PayRiseProps
  | TaxTrapProps
  | PercentileProps;

export function PageViewTracker(props: PageViewProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    switch (props.event) {
      case "salary_page_viewed":
        trackSalaryPageView({
          salary: props.salary,
          salaryPage: props.salaryPage,
          taxYear: props.taxYear,
        });
        return;
      case "pay_rise_viewed":
        trackPayRiseView({ from: props.from, to: props.to });
        return;
      case "tax_trap_viewed":
        trackTaxTrapView(props.surface ?? "page");
        return;
      case "percentile_viewed":
        trackPercentileView({
          salaryBand: props.salaryBand,
          ageBand: props.ageBand,
        });
        return;
    }
  }, [props]);

  return null;
}
