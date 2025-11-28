import { render, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { TakeHomeCalculator } from "@/components/take-home-calculator";

vi.mock("@/components/tabs/PayeTab", () => {
  return {
    PayeTab: ({
      onSummaryChange,
      onAnnualGrossChange,
      onNetAnnualChange,
      onGrossValueChange,
    }: any) => {
      React.useEffect(() => {
        onSummaryChange?.({
          annualNet: 48000,
          monthlyNet: 4000,
          weeklyNet: 923.08,
          annualGross: 60000,
        });
        onAnnualGrossChange?.(60000);
        onNetAnnualChange?.(48000);
        onGrossValueChange?.(60000);
      }, [
        onSummaryChange,
        onAnnualGrossChange,
        onNetAnnualChange,
        onGrossValueChange,
      ]);
      return <div data-testid="paye-tab">PAYE TAB</div>;
    },
  };
});

vi.mock("@/components/tabs/UmbrellaTab", () => ({
  UmbrellaTab: () => <div data-testid="umbrella-tab">UMB</div>,
}));

vi.mock("@/components/tabs/LimitedTab", () => ({
  LimitedTab: () => <div data-testid="limited-tab">LTD</div>,
}));

vi.mock("@/components/tabs/PeriodicTaxTab", () => ({
  PeriodicTaxTab: () => <div data-testid="periodic-tab">PERIODIC</div>,
}));

vi.mock("@/components/tabs/WealthPercentileTab", () => ({
  WealthPercentileTab: () => <div data-testid="wealth-tab">WEALTH</div>,
}));

describe("TakeHomeCalculator", () => {
  it("notifies listeners when summary and gross values change", async () => {
    const summarySpy = vi.fn();
    const grossSpy = vi.fn();
    const netSpy = vi.fn();

    render(
      <TakeHomeCalculator
        onSummaryChange={summarySpy}
        onGrossChange={grossSpy}
        onNetChange={netSpy}
      />,
    );

    await waitFor(() => {
      expect(summarySpy).toHaveBeenCalledWith(
        expect.objectContaining({ annualNet: 48000, annualGross: 60000 }),
      );
    });

    expect(grossSpy).toHaveBeenCalledWith(60000);
    expect(netSpy).toHaveBeenCalledWith(48000);
  });
});
